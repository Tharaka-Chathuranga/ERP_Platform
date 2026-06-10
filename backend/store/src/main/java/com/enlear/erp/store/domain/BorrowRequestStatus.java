package com.enlear.erp.store.domain;

/** Lifecycle of a borrow request. */
public enum BorrowRequestStatus {
    PENDING,
    APPROVED,
    REJECTED,
    ISSUED,
    RETURNED
}
