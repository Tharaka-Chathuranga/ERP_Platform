-- Capture the storage slot each received line is put away into, so stock can be
-- tracked per location on the item.

ALTER TABLE store.item_receival_item ADD COLUMN rack   VARCHAR(64);
ALTER TABLE store.item_receival_item ADD COLUMN "row"  VARCHAR(64);
ALTER TABLE store.item_receival_item ADD COLUMN "column" VARCHAR(64);
