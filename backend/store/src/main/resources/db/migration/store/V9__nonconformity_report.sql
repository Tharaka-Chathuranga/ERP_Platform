-- Rework the deviation-request workflow into an ISO 9001:2015 clause 8.7 aligned
-- Nonconformity Report (NCR): RAISED → UNDER_REVIEW → DISPOSITIONED → CLOSED (+ REJECTED),
-- capturing the deciding authority, disposition and closure verification (clause 8.7.2).

-- 1. Rename the aggregate tables.
ALTER TABLE store.deviation_requests      RENAME TO nonconformity_reports;
ALTER TABLE store.deviation_requests_item RENAME TO nonconformity_report_items;

-- 2. Rename existing columns to the nonconformity vocabulary.
ALTER TABLE store.nonconformity_reports RENAME COLUMN reason               TO description;
ALTER TABLE store.nonconformity_reports RENAME COLUMN stage                TO detection_stage;
ALTER TABLE store.nonconformity_reports RENAME COLUMN requested_by_user_id TO reported_by_user_id;
ALTER TABLE store.nonconformity_reports RENAME COLUMN requested_at         TO reported_at;
ALTER TABLE store.nonconformity_reports RENAME COLUMN approved_by_user_id  TO reviewed_by_user_id;
ALTER TABLE store.nonconformity_reports RENAME COLUMN approved_at          TO reviewed_at;
ALTER TABLE store.nonconformity_report_items RENAME COLUMN deviation_request_id TO nonconformity_report_id;

-- 3. Add the review, disposition and closure columns (clause 8.7.1–8.7.2).
ALTER TABLE store.nonconformity_reports
    ADD COLUMN review_note       VARCHAR(1000),
    ADD COLUMN disposition_type  VARCHAR(24),   -- USE_AS_IS|REWORK|SCRAP|RETURN_TO_SUPPLIER|REGRADE
    ADD COLUMN closed_by_user_id UUID,
    ADD COLUMN closed_at         TIMESTAMPTZ,
    ADD COLUMN verification_note VARCHAR(1000);

-- 4. Migrate existing rows onto the new lifecycle.
--    Previously-approved reports become a recorded USE_AS_IS disposition.
UPDATE store.nonconformity_reports SET disposition_type = 'USE_AS_IS' WHERE status = 'APPROVED';
UPDATE store.nonconformity_reports SET status = 'RAISED'        WHERE status = 'PENDING';
UPDATE store.nonconformity_reports SET status = 'DISPOSITIONED' WHERE status = 'APPROVED';
-- REJECTED is unchanged.

-- 5. Update column defaults.
ALTER TABLE store.nonconformity_reports ALTER COLUMN status         SET DEFAULT 'RAISED';
ALTER TABLE store.nonconformity_reports ALTER COLUMN detection_stage SET DEFAULT 'INCOMING';

-- 6. Rebuild indexes under the new names.
DROP INDEX IF EXISTS store.idx_deviation_status;
DROP INDEX IF EXISTS store.idx_deviation_stage;
DROP INDEX IF EXISTS store.idx_dev_item_dev;
DROP INDEX IF EXISTS store.idx_dev_item_item;
CREATE INDEX idx_ncr_status          ON store.nonconformity_reports(status);
CREATE INDEX idx_ncr_detection_stage ON store.nonconformity_reports(detection_stage);
CREATE INDEX idx_ncr_item_report     ON store.nonconformity_report_items(nonconformity_report_id);
CREATE INDEX idx_ncr_item_item       ON store.nonconformity_report_items(item_id);
