ALTER TABLE oilmart.oil_mart_sales
    ALTER COLUMN status TYPE VARCHAR(24);

ALTER TABLE oilmart.oil_mart_sales
    ADD COLUMN quotation_approved_by_user_id UUID,
    ADD COLUMN quotation_approved_at         TIMESTAMPTZ;
