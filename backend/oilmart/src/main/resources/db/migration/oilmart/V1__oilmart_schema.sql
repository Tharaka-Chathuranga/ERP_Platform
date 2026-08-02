CREATE TABLE oilmart.oil_mart_document_counters (
    doc_type    VARCHAR(8) NOT NULL,
    year        INTEGER    NOT NULL,
    last_number BIGINT     NOT NULL DEFAULT 0,
    PRIMARY KEY (doc_type, year)
);

CREATE TABLE oilmart.oil_mart_items (
    id                   UUID PRIMARY KEY,
    version              BIGINT        NOT NULL DEFAULT 0,
    code                 VARCHAR(64)   NOT NULL UNIQUE,
    name                 VARCHAR(200)  NOT NULL,
    oil_type             VARCHAR(24)   NOT NULL,
    brand                VARCHAR(100),
    grade                VARCHAR(100),
    description          VARCHAR(1000),
    reorder_level_litres NUMERIC(19,4) NOT NULL DEFAULT 0 CHECK (reorder_level_litres >= 0),
    status               VARCHAR(16)   NOT NULL DEFAULT 'ACTIVE',
    created_at TIMESTAMPTZ, created_by VARCHAR(100),
    updated_at TIMESTAMPTZ, updated_by VARCHAR(100)
);
CREATE INDEX idx_oil_mart_items_type   ON oilmart.oil_mart_items(oil_type);
CREATE INDEX idx_oil_mart_items_status ON oilmart.oil_mart_items(status);

CREATE TABLE oilmart.oil_mart_item_prices (
    id                  UUID PRIMARY KEY,
    version             BIGINT        NOT NULL DEFAULT 0,
    item_id             UUID          NOT NULL REFERENCES oilmart.oil_mart_items(id),
    buy_price           NUMERIC(19,4) NOT NULL CHECK (buy_price >= 0),
    sell_price          NUMERIC(19,4) NOT NULL CHECK (sell_price >= 0),
    effective_from      DATE          NOT NULL,
    effective_to        DATE,
    recorded_by_user_id UUID          NOT NULL,
    note                VARCHAR(1000),
    created_at TIMESTAMPTZ, created_by VARCHAR(100),
    updated_at TIMESTAMPTZ, updated_by VARCHAR(100),
    CONSTRAINT chk_oil_mart_price_range CHECK (effective_to IS NULL OR effective_to >= effective_from)
);
CREATE INDEX idx_oil_mart_prices_item  ON oilmart.oil_mart_item_prices(item_id);
CREATE INDEX idx_oil_mart_prices_range ON oilmart.oil_mart_item_prices(item_id, effective_from, effective_to);

CREATE TABLE oilmart.oil_mart_suppliers (
    id             UUID PRIMARY KEY,
    version        BIGINT       NOT NULL DEFAULT 0,
    code           VARCHAR(64)  NOT NULL UNIQUE,
    name           VARCHAR(200) NOT NULL,
    contact_person VARCHAR(150),
    phone          VARCHAR(50),
    email          VARCHAR(150),
    address        VARCHAR(500),
    status         VARCHAR(16)  NOT NULL DEFAULT 'ACTIVE',
    created_at TIMESTAMPTZ, created_by VARCHAR(100),
    updated_at TIMESTAMPTZ, updated_by VARCHAR(100)
);

CREATE TABLE oilmart.oil_mart_clients (
    id             UUID PRIMARY KEY,
    version        BIGINT       NOT NULL DEFAULT 0,
    code           VARCHAR(64)  NOT NULL UNIQUE,
    name           VARCHAR(200) NOT NULL,
    contact_person VARCHAR(150),
    phone          VARCHAR(50),
    email          VARCHAR(150),
    address        VARCHAR(500),
    status         VARCHAR(16)  NOT NULL DEFAULT 'ACTIVE',
    created_at TIMESTAMPTZ, created_by VARCHAR(100),
    updated_at TIMESTAMPTZ, updated_by VARCHAR(100)
);

CREATE TABLE oilmart.oil_mart_item_store (
    id               UUID PRIMARY KEY,
    version          BIGINT        NOT NULL DEFAULT 0,
    item_id          UUID          NOT NULL UNIQUE REFERENCES oilmart.oil_mart_items(id),
    quantity_on_hand NUMERIC(19,4) NOT NULL DEFAULT 0 CHECK (quantity_on_hand >= 0),
    last_movement_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ, created_by VARCHAR(100),
    updated_at TIMESTAMPTZ, updated_by VARCHAR(100)
);

CREATE TABLE oilmart.oil_mart_stock_movements (
    id               UUID PRIMARY KEY,
    version          BIGINT        NOT NULL DEFAULT 0,
    item_id          UUID          NOT NULL REFERENCES oilmart.oil_mart_items(id),
    movement_type    VARCHAR(16)   NOT NULL,
    quantity_delta   NUMERIC(19,4) NOT NULL,
    balance_after    NUMERIC(19,4) NOT NULL CHECK (balance_after >= 0),
    reference_type   VARCHAR(16)   NOT NULL,
    reference_id     UUID,
    reference_no     VARCHAR(64),
    moved_at         TIMESTAMPTZ   NOT NULL,
    moved_by_user_id UUID          NOT NULL,
    note             VARCHAR(1000),
    created_at TIMESTAMPTZ, created_by VARCHAR(100),
    updated_at TIMESTAMPTZ, updated_by VARCHAR(100)
);
CREATE INDEX idx_oil_mart_movements_item ON oilmart.oil_mart_stock_movements(item_id, moved_at DESC);
CREATE INDEX idx_oil_mart_movements_ref  ON oilmart.oil_mart_stock_movements(reference_id);

CREATE TABLE oilmart.oil_mart_receipts (
    id                   UUID PRIMARY KEY,
    version              BIGINT        NOT NULL DEFAULT 0,
    receipt_no           VARCHAR(32)   NOT NULL UNIQUE,
    supplier_id          UUID          NOT NULL REFERENCES oilmart.oil_mart_suppliers(id),
    reference_no         VARCHAR(100),
    received_at          TIMESTAMPTZ   NOT NULL,
    received_by_user_id  UUID          NOT NULL,
    total_cost           NUMERIC(19,4) NOT NULL DEFAULT 0,
    note                 VARCHAR(1000),
    created_at TIMESTAMPTZ, created_by VARCHAR(100),
    updated_at TIMESTAMPTZ, updated_by VARCHAR(100)
);
CREATE INDEX idx_oil_mart_receipts_supplier ON oilmart.oil_mart_receipts(supplier_id);
CREATE INDEX idx_oil_mart_receipts_received ON oilmart.oil_mart_receipts(received_at DESC);

CREATE TABLE oilmart.oil_mart_receipt_lines (
    id              UUID PRIMARY KEY,
    version         BIGINT        NOT NULL DEFAULT 0,
    receipt_id      UUID          NOT NULL REFERENCES oilmart.oil_mart_receipts(id) ON DELETE CASCADE,
    item_id         UUID          NOT NULL REFERENCES oilmart.oil_mart_items(id),
    quantity_litres NUMERIC(19,4) NOT NULL CHECK (quantity_litres > 0),
    buy_unit_price  NUMERIC(19,4) NOT NULL CHECK (buy_unit_price >= 0),
    line_total      NUMERIC(19,4) NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ, created_by VARCHAR(100),
    updated_at TIMESTAMPTZ, updated_by VARCHAR(100)
);
CREATE INDEX idx_oil_mart_receipt_lines_receipt ON oilmart.oil_mart_receipt_lines(receipt_id);

CREATE TABLE oilmart.oil_mart_sales (
    id                  UUID PRIMARY KEY,
    version             BIGINT        NOT NULL DEFAULT 0,
    sale_no             VARCHAR(32)   NOT NULL UNIQUE,
    client_id           UUID          NOT NULL REFERENCES oilmart.oil_mart_clients(id),
    status              VARCHAR(16)   NOT NULL DEFAULT 'QUOTATION',
    created_by_user_id  UUID          NOT NULL,

    quoted_at           TIMESTAMPTZ   NOT NULL,
    valid_until         DATE,

    ordered_at          TIMESTAMPTZ,

    approved_by_user_id UUID,
    approved_at         TIMESTAMPTZ,
    rejection_reason    VARCHAR(1000),

    dispatched_at        TIMESTAMPTZ,
    dispatched_by_user_id UUID,
    vehicle_no          VARCHAR(50),
    driver_name         VARCHAR(150),

    invoice_no          VARCHAR(32) UNIQUE,
    invoiced_at         TIMESTAMPTZ,
    invoiced_by_user_id UUID,
    payment_method      VARCHAR(16),

    cancellation_reason VARCHAR(1000),

    subtotal            NUMERIC(19,4) NOT NULL DEFAULT 0,
    discount_amount     NUMERIC(19,4) NOT NULL DEFAULT 0 CHECK (discount_amount >= 0),
    total               NUMERIC(19,4) NOT NULL DEFAULT 0,
    note                VARCHAR(1000),

    created_at TIMESTAMPTZ, created_by VARCHAR(100),
    updated_at TIMESTAMPTZ, updated_by VARCHAR(100)
);
CREATE INDEX idx_oil_mart_sales_status ON oilmart.oil_mart_sales(status);
CREATE INDEX idx_oil_mart_sales_client ON oilmart.oil_mart_sales(client_id);
CREATE INDEX idx_oil_mart_sales_quoted ON oilmart.oil_mart_sales(quoted_at DESC);

CREATE TABLE oilmart.oil_mart_sale_lines (
    id                UUID PRIMARY KEY,
    version           BIGINT        NOT NULL DEFAULT 0,
    sale_id           UUID          NOT NULL REFERENCES oilmart.oil_mart_sales(id) ON DELETE CASCADE,
    item_id           UUID          NOT NULL REFERENCES oilmart.oil_mart_items(id),
    quantity_litres   NUMERIC(19,4) NOT NULL CHECK (quantity_litres > 0),
    list_unit_price   NUMERIC(19,4) NOT NULL DEFAULT 0,
    unit_price        NUMERIC(19,4) NOT NULL CHECK (unit_price >= 0),
    is_price_override BOOLEAN       NOT NULL DEFAULT FALSE,
    discount_percent  NUMERIC(5,2)  NOT NULL DEFAULT 0 CHECK (discount_percent >= 0 AND discount_percent <= 100),
    line_total        NUMERIC(19,4) NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ, created_by VARCHAR(100),
    updated_at TIMESTAMPTZ, updated_by VARCHAR(100)
);
CREATE INDEX idx_oil_mart_sale_lines_sale ON oilmart.oil_mart_sale_lines(sale_id);
