package com.enlear.erp.store.controller.dto;

public final class QaDashboardResponses {

    private QaDashboardResponses() {
    }

    public record QaDefectSummaryResponse(
            long pendingCount,
            long approvedCount,
            long rejectedCount,
            long incomingCount,
            long inProgressCount,
            long finalCount,
            long totalCount) {
    }
}
