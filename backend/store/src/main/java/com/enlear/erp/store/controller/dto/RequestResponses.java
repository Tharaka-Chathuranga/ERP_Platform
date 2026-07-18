package com.enlear.erp.store.controller.dto;

import com.enlear.erp.store.model.BorrowRequest;
import com.enlear.erp.store.model.BorrowRequestStatus;
import com.enlear.erp.store.model.DetectionStage;
import com.enlear.erp.store.model.DispositionType;
import com.enlear.erp.store.model.NonconformityReport;
import com.enlear.erp.store.model.NonconformityReportItem;
import com.enlear.erp.store.model.NonconformityStatus;
import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;
import java.util.UUID;

/** Outbound representations for borrow request and nonconformity report workflows. */
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

    public record NonconformityItemResponse(UUID itemId, BigDecimal quantity) {

        public static NonconformityItemResponse from(NonconformityReportItem i) {
            return new NonconformityItemResponse(i.getItemId(), i.getQuantity());
        }
    }

    public record NonconformityReportResponse(
            UUID id, List<NonconformityItemResponse> items, NonconformityStatus status,
            DetectionStage detectionStage, String description,
            UUID reportedByUserId, Instant reportedAt,
            UUID reviewedByUserId, Instant reviewedAt, String reviewNote, DispositionType dispositionType,
            UUID closedByUserId, Instant closedAt, String verificationNote) {

        public static NonconformityReportResponse from(NonconformityReport r) {
            return new NonconformityReportResponse(r.getId(),
                    r.getItems().stream().map(NonconformityItemResponse::from).toList(),
                    r.getStatus(), r.getDetectionStage(), r.getDescription(),
                    r.getReportedByUserId(), r.getReportedAt(),
                    r.getReviewedByUserId(), r.getReviewedAt(), r.getReviewNote(), r.getDispositionType(),
                    r.getClosedByUserId(), r.getClosedAt(), r.getVerificationNote());
        }
    }
}
