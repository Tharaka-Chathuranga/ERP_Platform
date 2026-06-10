package com.enlear.erp.store.domain;

/**
 * Inventory valuation strategy for an item. Recorded on the item now so the
 * costing engine (added with the accounting module later) can value issues
 * consistently without a data migration.
 */
public enum ValuationMethod {
    FIFO,
    WEIGHTED_AVERAGE,
    STANDARD_COST
}
