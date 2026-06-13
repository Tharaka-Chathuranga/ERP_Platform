package com.enlear.erp.store.model;

/** Lifecycle of a borrow request. */
public enum BorrowRequestStatus {
    PENDING,
    APPROVED,
    REJECTED,
    ISSUED,
    RETURNED
}
