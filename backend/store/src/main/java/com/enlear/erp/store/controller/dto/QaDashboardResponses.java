package com.enlear.erp.store.controller.dto;

public final class QaDashboardResponses {

    private QaDashboardResponses() {
    }

    public record QaNonconformitySummaryResponse(
            long raisedCount,
            long underReviewCount,
            long dispositionedCount,
            long rejectedCount,
            long closedCount,
            long incomingCount,
            long inProgressCount,
            long finalCount,
            long totalCount) {
    }
}
