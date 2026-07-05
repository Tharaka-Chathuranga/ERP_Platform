package com.enlear.erp.store.model;

/** Lifecycle of a reorder alert. OPEN until stock recovers above reorder level. */
public enum ReorderAlertStatus {
    OPEN,
    RESOLVED
}
