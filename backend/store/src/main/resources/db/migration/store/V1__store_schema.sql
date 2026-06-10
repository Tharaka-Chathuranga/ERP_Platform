-- ════════════════════════════════════════════════════════════════════
--  STORE module schema: items, warehouses, the immutable stock-movement
--  ledger, and the derived stock-level projection.
--
--  Design notes:
--   * stock_movements is APPEND-ONLY — the source of truth for inventory.
--   * stock_levels is a projection kept in sync within the same transaction.
--   * Monetary/quantity columns use NUMERIC(19,4) — never floating point.
-- ════════════════════════════════════════════════════════════════════

CREATE TABLE store.items (
    id               UUID PRIMARY KEY,
    version          BIGINT       NOT NULL DEFAULT 0,
    sku              VARCHAR(64)  NOT NULL UNIQUE,
    name             VARCHAR(200) NOT NULL,
    description      VARCHAR(1000),
    unit_of_measure  VARCHAR(16)  NOT NULL,
    category         VARCHAR(100),
    valuation_method VARCHAR(32)  NOT NULL DEFAULT 'WEIGHTED_AVERAGE',
    reorder_level    NUMERIC(19,4) NOT NULL DEFAULT 0,
    status           VARCHAR(16)  NOT NULL DEFAULT 'ACTIVE',
    created_at       TIMESTAMPTZ,
    created_by       VARCHAR(100),
    updated_at       TIMESTAMPTZ,
    updated_by       VARCHAR(100)
);
CREATE INDEX idx_items_category ON store.items(category);
CREATE INDEX idx_items_status   ON store.items(status);

CREATE TABLE store.warehouses (
    id         UUID PRIMARY KEY,
    version    BIGINT       NOT NULL DEFAULT 0,
    code       VARCHAR(32)  NOT NULL UNIQUE,
    name       VARCHAR(150) NOT NULL,
    address    VARCHAR(500),
    active     BOOLEAN      NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ,
    created_by VARCHAR(100),
    updated_at TIMESTAMPTZ,
    updated_by VARCHAR(100)
);

CREATE TABLE store.stock_movements (
    id           UUID PRIMARY KEY,
    version      BIGINT        NOT NULL DEFAULT 0,
    item_id      UUID          NOT NULL REFERENCES store.items(id),
    warehouse_id UUID          NOT NULL REFERENCES store.warehouses(id),
    type         VARCHAR(32)   NOT NULL,
    quantity     NUMERIC(19,4) NOT NULL CHECK (quantity > 0),
    unit_cost    NUMERIC(19,4),
    reference    VARCHAR(100),
    note         VARCHAR(500),
    occurred_at  TIMESTAMPTZ   NOT NULL,
    created_at   TIMESTAMPTZ,
    created_by   VARCHAR(100),
    updated_at   TIMESTAMPTZ,
    updated_by   VARCHAR(100)
);
CREATE INDEX idx_movement_item_wh   ON store.stock_movements(item_id, warehouse_id);
CREATE INDEX idx_movement_occurred  ON store.stock_movements(occurred_at);

CREATE TABLE store.stock_levels (
    id               UUID PRIMARY KEY,
    version          BIGINT        NOT NULL DEFAULT 0,
    item_id          UUID          NOT NULL REFERENCES store.items(id),
    warehouse_id     UUID          NOT NULL REFERENCES store.warehouses(id),
    quantity_on_hand NUMERIC(19,4) NOT NULL DEFAULT 0 CHECK (quantity_on_hand >= 0),
    created_at       TIMESTAMPTZ,
    created_by       VARCHAR(100),
    updated_at       TIMESTAMPTZ,
    updated_by       VARCHAR(100),
    CONSTRAINT uq_stock_item_wh UNIQUE (item_id, warehouse_id)
);
