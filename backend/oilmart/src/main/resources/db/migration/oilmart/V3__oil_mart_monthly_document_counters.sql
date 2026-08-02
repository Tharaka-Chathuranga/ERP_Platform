DROP TABLE oilmart.oil_mart_document_counters;

CREATE TABLE oilmart.oil_mart_document_counters (
    doc_type    VARCHAR(8) NOT NULL,
    year        INTEGER    NOT NULL,
    month       INTEGER    NOT NULL CHECK (month BETWEEN 1 AND 12),
    last_number BIGINT     NOT NULL DEFAULT 0,
    PRIMARY KEY (doc_type, year, month)
);
