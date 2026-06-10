package com.enlear.erp.store.web.dto;

import com.enlear.erp.store.domain.BorrowRequest;
import com.enlear.erp.store.domain.BorrowRequestStatus;
import com.enlear.erp.store.domain.DeviationRequest;
import com.enlear.erp.store.domain.DeviationStage;
import com.enlear.erp.store.domain.DeviationStatus;
import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

/** Outbound representations for borrow and deviation request workflows. */
public final class RequestResponses {

    private RequestResponses() {
    }

    public record BorrowRequestResponse(
            UUID id, UUID itemId, BigDecimal quantity, BorrowRequestStatus status, String reason,
            UUID requestedByUserId, Instant requestedAt, UUID approvedByUserId, Instant approvedAt,
            UUID issueId) {

        public static BorrowRequestResponse from(BorrowRequest r) {
            return new BorrowRequestResponse(r.getId(), r.getItemId(), r.getQuantity(),
                    r.getStatus(), r.getReason(), r.getRequestedByUserId(), r.getRequestedAt(),
                    r.getApprovedByUserId(), r.getApprovedAt(), r.getIssueId());
        }
    }

    public record DeviationRequestResponse(
            UUID id, UUID itemId, BigDecimal quantity, DeviationStatus status, DeviationStage stage,
            String reason, UUID requestedByUserId, Instant requestedAt, UUID approvedByUserId,
            Instant approvedAt) {

        public static DeviationRequestResponse from(DeviationRequest r) {
            return new DeviationRequestResponse(r.getId(), r.getItemId(), r.getQuantity(),
                    r.getStatus(), r.getStage(), r.getReason(), r.getRequestedByUserId(),
                    r.getRequestedAt(), r.getApprovedByUserId(), r.getApprovedAt());
        }
    }
}
