package com.enlear.erp.store.model;

/**
 * A storage bin where an item is kept. Stored as an element of the item's
 * {@code locations} JSONB array — small, item-owned, and not queried on its
 * own, so it lives embedded rather than in a child table.
 */
public record Location(String rack, String row, String column, boolean primary) {
}
