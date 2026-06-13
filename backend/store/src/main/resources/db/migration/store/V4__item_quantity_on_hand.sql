-- ════════════════════════════════════════════════════════════════════
--  Store on-hand quantity directly on the item.
--
--  On-hand was previously DERIVED by summing the stock-movement ledger.
--  It now lives on store.items.quantity_on_hand as a maintained projection,
--  adjusted in the same transaction that records each movement. The
--  stock_movements ledger remains the append-only audit trail.
--
--  Existing items backfill from the current ledger sum so the stored value
--  matches history exactly. Inbound types (RECEIPT/ADJUSTMENT_IN/TRANSFER_IN)
--  add; the rest subtract.
-- ════════════════════════════════════════════════════════════════════

ALTER TABLE store.items
    ADD COLUMN quantity_on_hand NUMERIC(19,4) NOT NULL DEFAULT 0;

UPDATE store.items i
SET quantity_on_hand = COALESCE((
        SELECT SUM(CASE WHEN m.type IN ('RECEIPT', 'ADJUSTMENT_IN', 'TRANSFER_IN')
                        THEN m.quantity ELSE -m.quantity END)
        FROM store.stock_movements m
        WHERE m.item_id = i.id), 0);

ALTER TABLE store.items
    ADD CONSTRAINT chk_items_on_hand_non_negative CHECK (quantity_on_hand >= 0);
