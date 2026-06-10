-- ════════════════════════════════════════════════════════════════════
--  STORE module schema: items and the immutable stock-movement ledger.
--
--  Design notes:
--   * stock_movements is APPEND-ONLY — the source of truth for inventory.
--   * On-hand quantity is DERIVED by summing the signed ledger (no stored
--     projection table). Single-store model: no warehouse dimension.
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
