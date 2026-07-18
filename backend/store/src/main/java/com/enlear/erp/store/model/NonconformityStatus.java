package com.enlear.erp.store.model;

/**
 * Lifecycle of a nonconformity report (NCR) under ISO 9001:2015 clause 8.7
 * "Control of nonconforming outputs":
 * RAISED → UNDER_REVIEW → DISPOSITIONED → CLOSED, with a REJECTED branch off review.
 */
public enum NonconformityStatus {
    RAISED,
    UNDER_REVIEW,
    DISPOSITIONED,
    REJECTED,
    CLOSED
}
