-- ════════════════════════════════════════════════════════════════════
--  STORE module schema (single consolidated migration).
--
--  Design notes:
--   * stock_movements is APPEND-ONLY — the source of truth for inventory.
--   * On-hand quantity is DERIVED by summing the signed ledger (no stored
--     projection table). Single-store model: no warehouse dimension.
--   * Monetary/quantity columns use NUMERIC(19,4) — never floating point.
--   * Multi-item documents use a header + item-lines split (no embedded lists).
--   * store_keeper_id / *_user_id reference users.users but carry NO database
--     FK: store and user are independent modules. Validate at the app layer.
--   * item.locations is the ONE intentional embedded array (JSONB): a small,
--     item-owned list of bins, not queried from the outside or carrying qty.
-- ════════════════════════════════════════════════════════════════════

-- ── Item master data ────────────────────────────────────────────────
CREATE TABLE store.items (
    id                             UUID PRIMARY KEY,
    version                        BIGINT        NOT NULL DEFAULT 0,
    itemcode                       VARCHAR(64)   NOT NULL UNIQUE,
    name                           VARCHAR(200)  NOT NULL,
    description                    VARCHAR(1000),
    unit_of_measure                VARCHAR(16)   NOT NULL,
    unit_price                     NUMERIC(19,4) NOT NULL DEFAULT 0,
    category                       VARCHAR(100),
    valuation_method               VARCHAR(32)   NOT NULL DEFAULT 'WEIGHTED_AVERAGE',
    reorder_level                  NUMERIC(19,4) NOT NULL DEFAULT 0,
    is_critical_item               BOOLEAN       NOT NULL DEFAULT FALSE,
    is_approval_required_for_issue BOOLEAN       NOT NULL DEFAULT FALSE,
    -- Storage bins, e.g. [{"rack":"A","row":"2","column":"5","primary":true}]
    locations                      JSONB         NOT NULL DEFAULT '[]',
    status                         VARCHAR(16)   NOT NULL DEFAULT 'ACTIVE',
    created_at                     TIMESTAMPTZ,
    created_by                     VARCHAR(100),
    updated_at                     TIMESTAMPTZ,
    updated_by                     VARCHAR(100)
);
CREATE INDEX idx_items_category  ON store.items(category);
CREATE INDEX idx_items_status    ON store.items(status);
CREATE INDEX idx_items_locations ON store.items USING GIN (locations);

-- ── Append-only stock-movement ledger ───────────────────────────────
CREATE TABLE store.stock_movements (
    id           UUID PRIMARY KEY,
    version      BIGINT        NOT NULL DEFAULT 0,
    item_id      UUID          NOT NULL REFERENCES store.items(id),
    type         VARCHAR(32)   NOT NULL,
    quantity     NUMERIC(19,4) NOT NULL CHECK (quantity > 0),
    unit_cost    NUMERIC(19,4),
    reference    VARCHAR(100),
    occurred_at  TIMESTAMPTZ   NOT NULL,
    created_at   TIMESTAMPTZ,
    created_by   VARCHAR(100),
    updated_at   TIMESTAMPTZ,
    updated_by   VARCHAR(100)
);
CREATE INDEX idx_movement_item     ON store.stock_movements(item_id);
CREATE INDEX idx_movement_occurred ON store.stock_movements(occurred_at);

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

-- ── Goods receive note (GRN): header + item lines ───────────────────
CREATE TABLE store.good_receive_note (
    id              UUID PRIMARY KEY,
    version         BIGINT       NOT NULL DEFAULT 0,
    grn_number      VARCHAR(32)  NOT NULL UNIQUE,
    po_number       VARCHAR(64),
    invoice_number  VARCHAR(64),
    supplier_id     UUID         NOT NULL REFERENCES store.suppliers(id),
    store_keeper_id UUID         NOT NULL,                       -- users.users (no cross-module FK)
    status          VARCHAR(16)  NOT NULL DEFAULT 'DRAFT',       -- DRAFT|POSTED|CANCELLED
    received_at     TIMESTAMPTZ  NOT NULL,
    created_at TIMESTAMPTZ, created_by VARCHAR(100),
    updated_at TIMESTAMPTZ, updated_by VARCHAR(100)
);
CREATE INDEX idx_grn_supplier ON store.good_receive_note(supplier_id);
CREATE INDEX idx_grn_status   ON store.good_receive_note(status);
CREATE INDEX idx_grn_received ON store.good_receive_note(received_at);

CREATE TABLE store.good_receive_note_item (
    id                   UUID PRIMARY KEY,
    version              BIGINT        NOT NULL DEFAULT 0,
    good_receive_note_id UUID          NOT NULL REFERENCES store.good_receive_note(id) ON DELETE CASCADE,
    item_id              UUID          NOT NULL REFERENCES store.items(id),
    quantity             NUMERIC(19,4) NOT NULL CHECK (quantity > 0),
    unit_cost            NUMERIC(19,4),
    created_at TIMESTAMPTZ, created_by VARCHAR(100),
    updated_at TIMESTAMPTZ, updated_by VARCHAR(100)
);
CREATE INDEX idx_grn_items_grn  ON store.good_receive_note_item(good_receive_note_id);
CREATE INDEX idx_grn_items_item ON store.good_receive_note_item(item_id);

-- ── Issuing / borrowing: header + item lines ────────────────────────
CREATE TABLE store.issues (
    id                  UUID PRIMARY KEY,
    version             BIGINT       NOT NULL DEFAULT 0,
    issue_number        VARCHAR(32)  NOT NULL UNIQUE,
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

CREATE TABLE store.issues_item (
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
CREATE INDEX idx_issues_item_issue ON store.issues_item(issue_id);
CREATE INDEX idx_issues_item_item  ON store.issues_item(item_id);

-- ── Request workflows ───────────────────────────────────────────────
-- A borrow request references an ISSUE document (which carries the items/qty
-- via issues_item) rather than a single item.
CREATE TABLE store.borrow_requests (
    id                   UUID PRIMARY KEY,
    version              BIGINT        NOT NULL DEFAULT 0,
    issue_id             UUID          NOT NULL REFERENCES store.issues(id),
    status               VARCHAR(16)   NOT NULL DEFAULT 'PENDING', -- PENDING|APPROVED|REJECTED|ISSUED|RETURNED
    reason               VARCHAR(1000),
    requested_by_user_id UUID          NOT NULL,
    requested_at         TIMESTAMPTZ   NOT NULL,
    approved_by_user_id  UUID,
    approved_at          TIMESTAMPTZ,
    created_at TIMESTAMPTZ, created_by VARCHAR(100),
    updated_at TIMESTAMPTZ, updated_by VARCHAR(100)
);
CREATE INDEX idx_borrow_issue  ON store.borrow_requests(issue_id);
CREATE INDEX idx_borrow_user   ON store.borrow_requests(requested_by_user_id);
CREATE INDEX idx_borrow_status ON store.borrow_requests(status);

-- A deviation request is a multi-item document: header + item lines.
CREATE TABLE store.deviation_requests (
    id                   UUID PRIMARY KEY,
    version              BIGINT       NOT NULL DEFAULT 0,
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
CREATE INDEX idx_deviation_status ON store.deviation_requests(status);
CREATE INDEX idx_deviation_stage  ON store.deviation_requests(stage);

CREATE TABLE store.deviation_requests_item (
    id                   UUID PRIMARY KEY,
    version              BIGINT        NOT NULL DEFAULT 0,
    deviation_request_id UUID          NOT NULL REFERENCES store.deviation_requests(id) ON DELETE CASCADE,
    item_id              UUID          NOT NULL REFERENCES store.items(id),
    quantity             NUMERIC(19,4),
    created_at TIMESTAMPTZ, created_by VARCHAR(100),
    updated_at TIMESTAMPTZ, updated_by VARCHAR(100)
);
CREATE INDEX idx_dev_item_dev  ON store.deviation_requests_item(deviation_request_id);
CREATE INDEX idx_dev_item_item ON store.deviation_requests_item(item_id);
