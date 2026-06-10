package com.enlear.erp.store.domain;

/** Lifecycle state of an item. We deactivate rather than hard-delete. */
public enum ItemStatus {
    ACTIVE,
    INACTIVE
}
