package com.enlear.erp.store.model;

/** Lifecycle of an issue/borrow document. */
public enum IssueStatus {
    DRAFT,
    PENDING_APPROVAL,
    APPROVED,
    ISSUED,
    REJECTED,
    RETURNED
}
