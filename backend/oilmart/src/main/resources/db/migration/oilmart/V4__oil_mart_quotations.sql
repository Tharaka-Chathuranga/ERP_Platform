CREATE TABLE oilmart.oil_mart_quotations (
    id                  UUID PRIMARY KEY,
    version             BIGINT        NOT NULL DEFAULT 0,
    quotation_no        VARCHAR(32)   NOT NULL UNIQUE,
    client_id           UUID          NOT NULL REFERENCES oilmart.oil_mart_clients(id),
    status              VARCHAR(24)   NOT NULL DEFAULT 'DRAFT',
    created_by_user_id  UUID          NOT NULL,

    issued_date         DATE          NOT NULL,
    valid_until         DATE          NOT NULL,

    submitted_at        TIMESTAMPTZ,
    approved_by_user_id UUID,
    approved_at         TIMESTAMPTZ,
    rejected_by_user_id UUID,
    rejected_at         TIMESTAMPTZ,
    rejection_reason    VARCHAR(1000),
    cancellation_reason VARCHAR(1000),

    subtotal            NUMERIC(19,4) NOT NULL DEFAULT 0,
    gst_rate_percent    NUMERIC(5,2)  NOT NULL DEFAULT 0 CHECK (gst_rate_percent >= 0),
    gst_amount          NUMERIC(19,4) NOT NULL DEFAULT 0,
    grand_total         NUMERIC(19,4) NOT NULL DEFAULT 0,
    total_cost          NUMERIC(19,4) NOT NULL DEFAULT 0,
    total_profit        NUMERIC(19,4) NOT NULL DEFAULT 0,

    note                VARCHAR(1000),

    created_at TIMESTAMPTZ, created_by VARCHAR(100),
    updated_at TIMESTAMPTZ, updated_by VARCHAR(100),

    CONSTRAINT chk_oil_mart_quotations_validity CHECK (valid_until >= issued_date)
);
CREATE INDEX idx_oil_mart_quotations_status ON oilmart.oil_mart_quotations(status);
CREATE INDEX idx_oil_mart_quotations_client ON oilmart.oil_mart_quotations(client_id);
CREATE INDEX idx_oil_mart_quotations_issued ON oilmart.oil_mart_quotations(issued_date DESC);

CREATE TABLE oilmart.oil_mart_quotation_lines (
    id                UUID PRIMARY KEY,
    version           BIGINT        NOT NULL DEFAULT 0,
    quotation_id      UUID          NOT NULL REFERENCES oilmart.oil_mart_quotations(id) ON DELETE CASCADE,
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
CREATE INDEX idx_oil_mart_quotation_lines_quotation ON oilmart.oil_mart_quotation_lines(quotation_id);

INSERT INTO oilmart.oil_mart_quotations (
    id, version, quotation_no, client_id, status, created_by_user_id,
    issued_date, valid_until, submitted_at,
    approved_by_user_id, approved_at, rejection_reason, cancellation_reason,
    subtotal, gst_rate_percent, gst_amount, grand_total, total_cost, total_profit,
    note, created_at, created_by, updated_at, updated_by)
SELECT s.id,
       0,
       s.sale_no,
       s.client_id,
       CASE s.status
           WHEN 'QUOTATION'          THEN 'DRAFT'
           WHEN 'QUOTATION_APPROVAL' THEN 'PENDING_APPROVAL'
           WHEN 'REJECTED'           THEN 'REJECTED'
           WHEN 'CANCELLED'          THEN 'CANCELLED'
           ELSE 'APPROVED'
       END,
       s.created_by_user_id,
       (s.quoted_at AT TIME ZONE 'UTC')::date,
       COALESCE(s.valid_until, ((s.quoted_at AT TIME ZONE 'UTC') + INTERVAL '1 month')::date),
       CASE WHEN s.status = 'QUOTATION' THEN NULL ELSE s.quoted_at END,
       COALESCE(s.quotation_approved_by_user_id, s.approved_by_user_id),
       COALESCE(s.quotation_approved_at, s.approved_at),
       s.rejection_reason,
       s.cancellation_reason,
       s.total,
       0,
       0,
       s.total,
       0,
       0,
       s.note,
       s.created_at, s.created_by, s.updated_at, s.updated_by
FROM oilmart.oil_mart_sales s;

INSERT INTO oilmart.oil_mart_quotation_lines (
    id, version, quotation_id, item_id, quantity_litres, list_unit_price, unit_price,
    is_price_override, discount_percent, line_total, unit_cost, line_cost, line_profit,
    created_at, created_by, updated_at, updated_by)
SELECT l.id,
       0,
       l.sale_id,
       l.item_id,
       l.quantity_litres,
       l.list_unit_price,
       l.unit_price,
       l.is_price_override,
       l.discount_percent,
       l.line_total,
       cost.unit_cost,
       ROUND(cost.unit_cost * l.quantity_litres, 4),
       ROUND(l.line_total - (cost.unit_cost * l.quantity_litres), 4),
       l.created_at, l.created_by, l.updated_at, l.updated_by
FROM oilmart.oil_mart_sale_lines l
JOIN oilmart.oil_mart_sales s ON s.id = l.sale_id
CROSS JOIN LATERAL (
    SELECT COALESCE((
        SELECT p.buy_price
        FROM oilmart.oil_mart_item_prices p
        WHERE p.item_id = l.item_id
          AND p.effective_from <= (s.quoted_at AT TIME ZONE 'UTC')::date
          AND (p.effective_to IS NULL OR p.effective_to >= (s.quoted_at AT TIME ZONE 'UTC')::date)
        ORDER BY p.effective_from DESC
        LIMIT 1
    ), 0) AS unit_cost
) cost;

UPDATE oilmart.oil_mart_quotations q
SET total_cost   = totals.total_cost,
    total_profit = totals.total_profit
FROM (
    SELECT quotation_id,
           SUM(line_cost)   AS total_cost,
           SUM(line_profit) AS total_profit
    FROM oilmart.oil_mart_quotation_lines
    GROUP BY quotation_id
) totals
WHERE q.id = totals.quotation_id;
