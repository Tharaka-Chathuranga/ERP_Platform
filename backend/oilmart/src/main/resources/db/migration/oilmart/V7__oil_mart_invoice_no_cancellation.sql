ALTER TABLE oilmart.oil_mart_invoices DROP COLUMN cancellation_reason;

DROP INDEX oilmart.uq_oil_mart_invoices_live_quotation;
CREATE UNIQUE INDEX uq_oil_mart_invoices_quotation
    ON oilmart.oil_mart_invoices(quotation_id);
