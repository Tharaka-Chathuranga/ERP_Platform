-- ════════════════════════════════════════════════════════════════════
--  Stock count-adjustment requests.
--
--  An approval workflow in front of stock-take corrections: a request to set
--  an item's on-hand to a new value. Stock is only changed when an admin
--  approves, at which point the service posts the reconciling ADJUSTMENT_IN/OUT
--  movement (the ledger remains the source of truth). current_quantity is the
--  on-hand snapshot captured at request time, kept for audit/display only.
-- ════════════════════════════════════════════════════════════════════

CREATE TABLE store.stock_count_adjustment_requests (
    id                   UUID PRIMARY KEY,
    version              BIGINT       NOT NULL DEFAULT 0,
    item_id              UUID         NOT NULL REFERENCES store.items(id),
    current_quantity     NUMERIC(19,4) NOT NULL,
    requested_quantity   NUMERIC(19,4) NOT NULL,
    reason               VARCHAR(1000),
    status               VARCHAR(16)  NOT NULL DEFAULT 'PENDING', -- PENDING|APPROVED|REJECTED
    requested_by_user_id UUID         NOT NULL,
    requested_at         TIMESTAMPTZ  NOT NULL,
    approved_by_user_id  UUID,
    approved_at          TIMESTAMPTZ,
    created_at TIMESTAMPTZ, created_by VARCHAR(100),
    updated_at TIMESTAMPTZ, updated_by VARCHAR(100),
    CONSTRAINT chk_count_adjustment_requested_qty_non_negative CHECK (requested_quantity >= 0)
);

-- Drives the pending-requests queue (status filter, newest first).
CREATE INDEX idx_count_adjustment_status ON store.stock_count_adjustment_requests (status);
CREATE INDEX idx_count_adjustment_item ON store.stock_count_adjustment_requests (item_id);
