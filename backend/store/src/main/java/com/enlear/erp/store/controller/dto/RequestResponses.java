package com.enlear.erp.store.controller.dto;

import com.enlear.erp.store.model.BorrowRequest;
import com.enlear.erp.store.model.BorrowRequestStatus;
import com.enlear.erp.store.model.DeviationRequest;
import com.enlear.erp.store.model.DeviationRequestItem;
import com.enlear.erp.store.model.DeviationStage;
import com.enlear.erp.store.model.DeviationStatus;
import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;
import java.util.UUID;

/** Outbound representations for borrow and deviation request workflows. */
public final class RequestResponses {

    private RequestResponses() {
    }

    public record BorrowRequestResponse(
            UUID id, UUID issueId, BorrowRequestStatus status, String reason,
            UUID requestedByUserId, Instant requestedAt, UUID approvedByUserId, Instant approvedAt) {

        public static BorrowRequestResponse from(BorrowRequest r) {
            return new BorrowRequestResponse(r.getId(), r.getIssueId(),
                    r.getStatus(), r.getReason(), r.getRequestedByUserId(), r.getRequestedAt(),
                    r.getApprovedByUserId(), r.getApprovedAt());
        }
    }

    public record DeviationItemResponse(UUID itemId, BigDecimal quantity) {

        public static DeviationItemResponse from(DeviationRequestItem i) {
            return new DeviationItemResponse(i.getItemId(), i.getQuantity());
        }
    }

    public record DeviationRequestResponse(
            UUID id, List<DeviationItemResponse> items, DeviationStatus status, DeviationStage stage,
            String reason, UUID requestedByUserId, Instant requestedAt, UUID approvedByUserId,
            Instant approvedAt) {

        public static DeviationRequestResponse from(DeviationRequest r) {
            return new DeviationRequestResponse(r.getId(),
                    r.getItems().stream().map(DeviationItemResponse::from).toList(),
                    r.getStatus(), r.getStage(), r.getReason(), r.getRequestedByUserId(),
                    r.getRequestedAt(), r.getApprovedByUserId(), r.getApprovedAt());
        }
    }
}
