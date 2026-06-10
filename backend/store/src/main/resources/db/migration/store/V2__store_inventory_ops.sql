-- ════════════════════════════════════════════════════════════════════
--  STORE module — inventory operations: richer item master data, suppliers,
--  goods receiving (GRN), issuing/borrowing, and request workflows.
--
--  Design notes (carried over from V1):
--   * Money / quantity columns use NUMERIC(19,4) — never floating point.
--   * Multi-item documents use a header + lines split (no embedded lists).
--   * Receiving/issuing POST into store.stock_movements (the append-only
--     ledger from V1); stock_levels stays the single source of on-hand qty.
--     => items carry NO currentQuantity column — it is read from stock_levels.
--   * store_keeper_id / *_user_id reference users.users but carry NO database
--     FK: store and user are independent modules. Validate at the app layer.
--   * item.locations is the ONE intentional embedded array (JSONB): a small,
--     item-owned list of bins, not queried from the outside or carrying qty.
-- ════════════════════════════════════════════════════════════════════

-- ── Item master-data extensions ─────────────────────────────────────
ALTER TABLE store.items ADD COLUMN unit_price                      NUMERIC(19,4) NOT NULL DEFAULT 0;
ALTER TABLE store.items ADD COLUMN is_critical_item               BOOLEAN       NOT NULL DEFAULT FALSE;
ALTER TABLE store.items ADD COLUMN is_approval_required_for_issue BOOLEAN       NOT NULL DEFAULT FALSE;

-- Storage bins, e.g. [{"rack":"A","row":"2","column":"5","primary":true}]
ALTER TABLE store.items ADD COLUMN locations                       JSONB         NOT NULL DEFAULT '[]';
CREATE INDEX idx_items_locations ON store.items USING GIN (locations);

-- ── Suppliers ───────────────────────────────────────────────────────
CREATE TABLE store.suppliers (
    id         UUID PRIMARY KEY,
    version    BIGINT       NOT NULL DEFAULT 0,
    code       VARCHAR(32)  NOT NULL UNIQUE,
    name       VARCHAR(200) NOT NULL,
    address    VARCHAR(500),
    country    VARCHAR(100),
    email      VARCHAR(200),
    phone      VARCHAR(50),
    status     VARCHAR(16)  NOT NULL DEFAULT 'ACTIVE',
    created_at TIMESTAMPTZ, created_by VARCHAR(100),
    updated_at TIMESTAMPTZ, updated_by VARCHAR(100)
);
CREATE INDEX idx_suppliers_status ON store.suppliers(status);

-- supplier ↔ item (many-to-many) with sourcing data
CREATE TABLE store.supplier_items (
    id                  UUID PRIMARY KEY,
    version             BIGINT NOT NULL DEFAULT 0,
    supplier_id         UUID   NOT NULL REFERENCES store.suppliers(id),
    item_id             UUID   NOT NULL REFERENCES store.items(id),
    supplier_sku        VARCHAR(64),
    lead_time_days      INTEGER,
    last_purchase_price NUMERIC(19,4),
    created_at TIMESTAMPTZ, created_by VARCHAR(100),
    updated_at TIMESTAMPTZ, updated_by VARCHAR(100),
    CONSTRAINT uq_supplier_item UNIQUE (supplier_id, item_id)
);
CREATE INDEX idx_supplier_items_item ON store.supplier_items(item_id);

-- ── Goods receiving (GRN): header + lines ───────────────────────────
CREATE TABLE store.goods_receipts (
    id              UUID PRIMARY KEY,
    version         BIGINT       NOT NULL DEFAULT 0,
    grn_number      VARCHAR(32)  NOT NULL UNIQUE,
    po_number       VARCHAR(64),
    invoice_number  VARCHAR(64),
    supplier_id     UUID         NOT NULL REFERENCES store.suppliers(id),
    warehouse_id    UUID         NOT NULL REFERENCES store.warehouses(id),
    store_keeper_id UUID         NOT NULL,                       -- users.users (no cross-module FK)
    status          VARCHAR(16)  NOT NULL DEFAULT 'DRAFT',       -- DRAFT|POSTED|CANCELLED
    received_at     TIMESTAMPTZ  NOT NULL,
    created_at TIMESTAMPTZ, created_by VARCHAR(100),
    updated_at TIMESTAMPTZ, updated_by VARCHAR(100)
);
CREATE INDEX idx_grn_supplier ON store.goods_receipts(supplier_id);
CREATE INDEX idx_grn_status   ON store.goods_receipts(status);
CREATE INDEX idx_grn_received ON store.goods_receipts(received_at);

CREATE TABLE store.goods_receipt_lines (
    id               UUID PRIMARY KEY,
    version          BIGINT        NOT NULL DEFAULT 0,
    goods_receipt_id UUID          NOT NULL REFERENCES store.goods_receipts(id) ON DELETE CASCADE,
    item_id          UUID          NOT NULL REFERENCES store.items(id),
    quantity         NUMERIC(19,4) NOT NULL CHECK (quantity > 0),
    unit_cost        NUMERIC(19,4),
    created_at TIMESTAMPTZ, created_by VARCHAR(100),
    updated_at TIMESTAMPTZ, updated_by VARCHAR(100)
);
CREATE INDEX idx_grn_lines_grn  ON store.goods_receipt_lines(goods_receipt_id);
CREATE INDEX idx_grn_lines_item ON store.goods_receipt_lines(item_id);

-- ── Issuing / borrowing: header + lines ─────────────────────────────
CREATE TABLE store.issues (
    id                  UUID PRIMARY KEY,
    version             BIGINT       NOT NULL DEFAULT 0,
    issue_number        VARCHAR(32)  NOT NULL UNIQUE,
    warehouse_id        UUID         NOT NULL REFERENCES store.warehouses(id),
    borrowing_user_id   UUID         NOT NULL,                   -- users.users (no FK)
    store_keeper_id     UUID         NOT NULL,                   -- users.users (no FK)
    status              VARCHAR(20)  NOT NULL DEFAULT 'DRAFT',
                        -- DRAFT|PENDING_APPROVAL|APPROVED|ISSUED|REJECTED|RETURNED
    approved_by_user_id UUID,
    approved_at         TIMESTAMPTZ,
    issued_at           TIMESTAMPTZ,
    created_at TIMESTAMPTZ, created_by VARCHAR(100),
    updated_at TIMESTAMPTZ, updated_by VARCHAR(100)
);
CREATE INDEX idx_issues_user   ON store.issues(borrowing_user_id);
CREATE INDEX idx_issues_status ON store.issues(status);

CREATE TABLE store.issue_lines (
    id                UUID PRIMARY KEY,
    version           BIGINT        NOT NULL DEFAULT 0,
    issue_id          UUID          NOT NULL REFERENCES store.issues(id) ON DELETE CASCADE,
    item_id           UUID          NOT NULL REFERENCES store.items(id),
    quantity          NUMERIC(19,4) NOT NULL CHECK (quantity > 0),
    is_returnable     BOOLEAN       NOT NULL DEFAULT FALSE,
    returned_quantity NUMERIC(19,4) NOT NULL DEFAULT 0 CHECK (returned_quantity >= 0),
    created_at TIMESTAMPTZ, created_by VARCHAR(100),
    updated_at TIMESTAMPTZ, updated_by VARCHAR(100)
);
CREATE INDEX idx_issue_lines_issue ON store.issue_lines(issue_id);
CREATE INDEX idx_issue_lines_item  ON store.issue_lines(item_id);

-- ── Request workflows ───────────────────────────────────────────────
CREATE TABLE store.borrow_requests (
    id                   UUID PRIMARY KEY,
    version              BIGINT        NOT NULL DEFAULT 0,
    item_id              UUID          NOT NULL REFERENCES store.items(id),
    quantity             NUMERIC(19,4) NOT NULL CHECK (quantity > 0),
    status               VARCHAR(16)   NOT NULL DEFAULT 'PENDING', -- PENDING|APPROVED|REJECTED|ISSUED|RETURNED
    reason               VARCHAR(1000),
    requested_by_user_id UUID          NOT NULL,
    requested_at         TIMESTAMPTZ   NOT NULL,
    approved_by_user_id  UUID,
    approved_at          TIMESTAMPTZ,
    issue_id             UUID          REFERENCES store.issues(id),  -- set once fulfilled
    created_at TIMESTAMPTZ, created_by VARCHAR(100),
    updated_at TIMESTAMPTZ, updated_by VARCHAR(100)
);
CREATE INDEX idx_borrow_item   ON store.borrow_requests(item_id);
CREATE INDEX idx_borrow_user   ON store.borrow_requests(requested_by_user_id);
CREATE INDEX idx_borrow_status ON store.borrow_requests(status);

CREATE TABLE store.deviation_requests (
    id                   UUID PRIMARY KEY,
    version              BIGINT       NOT NULL DEFAULT 0,
    item_id              UUID         NOT NULL REFERENCES store.items(id),
    quantity             NUMERIC(19,4),
    status               VARCHAR(16)  NOT NULL DEFAULT 'PENDING',  -- PENDING|APPROVED|REJECTED
    stage                VARCHAR(16)  NOT NULL DEFAULT 'INCOMING', -- INCOMING|IN_PROGRESS|FINAL
    reason               VARCHAR(1000),
    requested_by_user_id UUID         NOT NULL,
    requested_at         TIMESTAMPTZ  NOT NULL,
    approved_by_user_id  UUID,
    approved_at          TIMESTAMPTZ,
    created_at TIMESTAMPTZ, created_by VARCHAR(100),
    updated_at TIMESTAMPTZ, updated_by VARCHAR(100)
);
CREATE INDEX idx_deviation_item   ON store.deviation_requests(item_id);
CREATE INDEX idx_deviation_status ON store.deviation_requests(status);
CREATE INDEX idx_deviation_stage  ON store.deviation_requests(stage);
