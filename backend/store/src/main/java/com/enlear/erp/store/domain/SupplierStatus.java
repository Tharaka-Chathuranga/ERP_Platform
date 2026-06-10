package com.enlear.erp.store.domain;

/** Lifecycle state of a supplier. We deactivate rather than hard-delete. */
public enum SupplierStatus {
    ACTIVE,
    INACTIVE
}
