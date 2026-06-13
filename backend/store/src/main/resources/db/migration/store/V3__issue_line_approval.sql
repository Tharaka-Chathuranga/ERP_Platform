-- ════════════════════════════════════════════════════════════════════
--  Per-line approval for goods issues.
--
--  Approval moves from the document to the individual issued line: a line
--  whose item requires approval starts PENDING and is approved/rejected on
--  its own. The document status (store.issues.status) is derived from the
--  mix of line states by the application.
--
--  Existing rows predate per-line approval, so they backfill to APPROVED
--  (they were already issued or approved at the document level).
-- ════════════════════════════════════════════════════════════════════

ALTER TABLE store.issues_item
    ADD COLUMN approval_status     VARCHAR(20) NOT NULL DEFAULT 'APPROVED'
        CONSTRAINT chk_issues_item_approval_status
        CHECK (approval_status IN ('PENDING', 'APPROVED', 'REJECTED')),
    ADD COLUMN approved_by_user_id UUID,                 -- users.users (no FK)
    ADD COLUMN approved_at         TIMESTAMPTZ;

CREATE INDEX idx_issues_item_approval ON store.issues_item(approval_status);
