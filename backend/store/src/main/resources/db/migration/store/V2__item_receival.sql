-- ── Item receival: the physical "goods arrived" event ───────────────
-- Every receival is recorded here and immediately posts RECEIPT stock
-- movements. A Goods Receive Note (GRN) is generated separately:
--   * no PO            → a GRN is generated for this receival at once
--   * PO, all received → one GRN aggregates every open receival for the PO
--   * PO, partial      → no GRN yet (good_receive_note_id stays NULL)
CREATE TABLE store.item_receival (
    id                   UUID PRIMARY KEY,
    version              BIGINT       NOT NULL DEFAULT 0,
    receival_number      VARCHAR(32)  NOT NULL UNIQUE,
    po_number            VARCHAR(64),
    invoice_number       VARCHAR(64),
    supplier_id          UUID         REFERENCES store.suppliers(id),  -- registered supplier (nullable)
    supplier_name        VARCHAR(200),                                 -- unregistered supplier (free text)
    all_received_for_po  BOOLEAN      NOT NULL DEFAULT FALSE,
    store_keeper_id      UUID         NOT NULL,                        -- users.users (no cross-module FK)
    good_receive_note_id UUID         REFERENCES store.good_receive_note(id), -- set once rolled into a GRN
    received_at          TIMESTAMPTZ  NOT NULL,
    created_at TIMESTAMPTZ, created_by VARCHAR(100),
    updated_at TIMESTAMPTZ, updated_by VARCHAR(100),
    -- exactly one supplier identity: registered id XOR free-text name
    CONSTRAINT ck_receival_supplier
        CHECK ((supplier_id IS NOT NULL) <> (supplier_name IS NOT NULL))
);
CREATE INDEX idx_receival_po       ON store.item_receival(po_number);
CREATE INDEX idx_receival_supplier ON store.item_receival(supplier_id);
CREATE INDEX idx_receival_grn      ON store.item_receival(good_receive_note_id);
CREATE INDEX idx_receival_received ON store.item_receival(received_at);

CREATE TABLE store.item_receival_item (
    id               UUID PRIMARY KEY,
    version          BIGINT        NOT NULL DEFAULT 0,
    item_receival_id UUID          NOT NULL REFERENCES store.item_receival(id) ON DELETE CASCADE,
    item_id          UUID          NOT NULL REFERENCES store.items(id),
    quantity         NUMERIC(19,4) NOT NULL CHECK (quantity > 0),
    unit_cost        NUMERIC(19,4),
    created_at TIMESTAMPTZ, created_by VARCHAR(100),
    updated_at TIMESTAMPTZ, updated_by VARCHAR(100)
);
CREATE INDEX idx_receival_item_receival ON store.item_receival_item(item_receival_id);
CREATE INDEX idx_receival_item_item     ON store.item_receival_item(item_id);

-- A GRN may now belong to an unregistered supplier, so its supplier_id is
-- nullable and it carries an optional free-text supplier name to match.
ALTER TABLE store.good_receive_note ALTER COLUMN supplier_id DROP NOT NULL;
ALTER TABLE store.good_receive_note ADD COLUMN supplier_name VARCHAR(200);
