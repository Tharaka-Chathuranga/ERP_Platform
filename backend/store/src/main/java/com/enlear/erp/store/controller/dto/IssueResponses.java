package com.enlear.erp.store.controller.dto;

import com.enlear.erp.store.model.Issue;
import com.enlear.erp.store.model.IssueLine;
import com.enlear.erp.store.model.IssueLineStatus;
import com.enlear.erp.store.model.IssueStatus;
import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;
import java.util.UUID;

/** Outbound representations for issue / borrow documents. */
public final class IssueResponses {

    private IssueResponses() {
    }

    public record IssueLineResponse(
            UUID id, UUID itemId, BigDecimal quantity, boolean returnable,
            BigDecimal returnedQuantity, IssueLineStatus approvalStatus,
            UUID approvedByUserId, Instant approvedAt) {

        public static IssueLineResponse from(IssueLine l) {
            return new IssueLineResponse(l.getId(), l.getItemId(), l.getQuantity(),
                    l.isReturnable(), l.getReturnedQuantity(), l.getApprovalStatus(),
                    l.getApprovedByUserId(), l.getApprovedAt());
        }
    }

    public record IssueResponse(
            UUID id, String issueNumber, UUID borrowingUserId, UUID storeKeeperId,
            IssueStatus status, UUID approvedByUserId, Instant approvedAt, Instant issuedAt,
            List<IssueLineResponse> lines) {

        public static IssueResponse from(Issue i) {
            return new IssueResponse(i.getId(), i.getIssueNumber(),
                    i.getBorrowingUserId(), i.getStoreKeeperId(), i.getStatus(),
                    i.getApprovedByUserId(), i.getApprovedAt(), i.getIssuedAt(),
                    i.getLines().stream().map(IssueLineResponse::from).toList());
        }
    }
}
