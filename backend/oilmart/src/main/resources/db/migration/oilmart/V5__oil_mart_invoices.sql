CREATE TABLE oilmart.oil_mart_invoices (
    id                  UUID PRIMARY KEY,
    invoice_no          VARCHAR(32)   NOT NULL UNIQUE,
    quotation_id        UUID          NOT NULL REFERENCES oilmart.oil_mart_quotations(id),
    quotation_no        VARCHAR(32)   NOT NULL,
    client_id           UUID          NOT NULL REFERENCES oilmart.oil_mart_clients(id),
    status              VARCHAR(24)   NOT NULL DEFAULT 'PENDING_APPROVAL',
    created_by_user_id  UUID          NOT NULL,

    invoice_date        DATE          NOT NULL,

    approved_by_user_id UUID,
    approved_at         TIMESTAMPTZ,
    rejected_by_user_id UUID,
    rejected_at         TIMESTAMPTZ,
    rejection_reason    VARCHAR(1000),
    cancellation_reason VARCHAR(1000),

    bank_account_name   VARCHAR(200),
    bank_name           VARCHAR(200),
    bank_branch         VARCHAR(200),
    bank_account_number VARCHAR(64),
    bank_swift_code     VARCHAR(32),

    subtotal            NUMERIC(19,4) NOT NULL DEFAULT 0,
    gst_rate_percent    NUMERIC(5,2)  NOT NULL DEFAULT 0 CHECK (gst_rate_percent >= 0),
    gst_amount          NUMERIC(19,4) NOT NULL DEFAULT 0,
    grand_total         NUMERIC(19,4) NOT NULL DEFAULT 0,
    total_cost          NUMERIC(19,4) NOT NULL DEFAULT 0,
    total_profit        NUMERIC(19,4) NOT NULL DEFAULT 0,

    note                VARCHAR(1000),

    created_at TIMESTAMPTZ, created_by VARCHAR(100),
    updated_at TIMESTAMPTZ, updated_by VARCHAR(100)
);
CREATE INDEX idx_oil_mart_invoices_status ON oilmart.oil_mart_invoices(status);
CREATE INDEX idx_oil_mart_invoices_client ON oilmart.oil_mart_invoices(client_id);
CREATE INDEX idx_oil_mart_invoices_date ON oilmart.oil_mart_invoices(invoice_date DESC);
CREATE UNIQUE INDEX uq_oil_mart_invoices_live_quotation
    ON oilmart.oil_mart_invoices(quotation_id)
    WHERE status <> 'CANCELLED';

CREATE TABLE oilmart.oil_mart_invoice_lines (
    id                UUID PRIMARY KEY,
    version           BIGINT        NOT NULL DEFAULT 0,
    invoice_id        UUID          NOT NULL REFERENCES oilmart.oil_mart_invoices(id) ON DELETE CASCADE,
    item_id           UUID          NOT NULL REFERENCES oilmart.oil_mart_items(id),
    quantity_litres   NUMERIC(19,4) NOT NULL CHECK (quantity_litres > 0),
    list_unit_price   NUMERIC(19,4) NOT NULL DEFAULT 0,
    unit_price        NUMERIC(19,4) NOT NULL CHECK (unit_price >= 0),
    is_price_override BOOLEAN       NOT NULL DEFAULT FALSE,
    discount_percent  NUMERIC(5,2)  NOT NULL DEFAULT 0 CHECK (discount_percent >= 0 AND discount_percent <= 100),
    line_total        NUMERIC(19,4) NOT NULL DEFAULT 0,
    unit_cost         NUMERIC(19,4) NOT NULL DEFAULT 0,
    line_cost         NUMERIC(19,4) NOT NULL DEFAULT 0,
    line_profit       NUMERIC(19,4) NOT NULL DEFAULT 0,

    created_at TIMESTAMPTZ, created_by VARCHAR(100),
    updated_at TIMESTAMPTZ, updated_by VARCHAR(100)
);
CREATE INDEX idx_oil_mart_invoice_lines_invoice ON oilmart.oil_mart_invoice_lines(invoice_id);

INSERT INTO oilmart.oil_mart_invoices (
    id, invoice_no, quotation_id, quotation_no, client_id, status,
    created_by_user_id, invoice_date, approved_by_user_id, approved_at,
    subtotal, gst_rate_percent, gst_amount, grand_total, total_cost, total_profit,
    note, created_at, created_by, updated_at, updated_by)
SELECT gen_random_uuid(),
       s.invoice_no,
       q.id,
       q.quotation_no,
       q.client_id,
       'APPROVED',
       COALESCE(s.invoiced_by_user_id, s.created_by_user_id),
       (s.invoiced_at AT TIME ZONE 'UTC')::date,
       COALESCE(s.invoiced_by_user_id, s.created_by_user_id),
       s.invoiced_at,
       q.subtotal, q.gst_rate_percent, q.gst_amount, q.grand_total,
       q.total_cost, q.total_profit,
       s.note, s.created_at, s.created_by, s.updated_at, s.updated_by
FROM oilmart.oil_mart_sales s
JOIN oilmart.oil_mart_quotations q ON q.id = s.id
WHERE s.invoice_no IS NOT NULL;

INSERT INTO oilmart.oil_mart_invoice_lines (
    id, version, invoice_id, item_id, quantity_litres, list_unit_price, unit_price,
    is_price_override, discount_percent, line_total, unit_cost, line_cost, line_profit,
    created_at, created_by, updated_at, updated_by)
SELECT gen_random_uuid(),
       0,
       i.id,
       l.item_id,
       l.quantity_litres,
       l.list_unit_price,
       l.unit_price,
       l.is_price_override,
       l.discount_percent,
       l.line_total,
       l.unit_cost,
       l.line_cost,
       l.line_profit,
       l.created_at, l.created_by, l.updated_at, l.updated_by
FROM oilmart.oil_mart_invoices i
JOIN oilmart.oil_mart_quotation_lines l ON l.quotation_id = i.quotation_id;

DROP TABLE oilmart.oil_mart_sale_lines;
DROP TABLE oilmart.oil_mart_sales;
