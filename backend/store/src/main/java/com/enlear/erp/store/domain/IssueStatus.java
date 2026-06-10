package com.enlear.erp.store.domain;

/** Lifecycle of an issue/borrow document. */
public enum IssueStatus {
    DRAFT,
    PENDING_APPROVAL,
    APPROVED,
    ISSUED,
    REJECTED,
    RETURNED
}
