package com.enlear.erp.store.domain;

import com.enlear.erp.shared.domain.BaseEntity;
import com.enlear.erp.shared.error.BusinessRuleException;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Table;
import java.time.Instant;
import java.util.UUID;
import lombok.Getter;
import lombok.NoArgsConstructor;

/**
 * A user's request to borrow against an {@link Issue} document (which carries the
 * items and quantities via its lines). Moves through an approval workflow.
 */
@Entity
@Table(name = "borrow_requests", schema = "store")
@Getter
@NoArgsConstructor
public class BorrowRequest extends BaseEntity {

    @Column(name = "issue_id", nullable = false)
    private UUID issueId;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 16)
    private BorrowRequestStatus status = BorrowRequestStatus.PENDING;

    @Column(length = 1000)
    private String reason;

    @Column(name = "requested_by_user_id", nullable = false)
    private UUID requestedByUserId;

    @Column(name = "requested_at", nullable = false)
    private Instant requestedAt;

    @Column(name = "approved_by_user_id")
    private UUID approvedByUserId;

    @Column(name = "approved_at")
    private Instant approvedAt;

    public BorrowRequest(UUID issueId, String reason, UUID requestedByUserId) {
        this.issueId = issueId;
        this.reason = reason;
        this.requestedByUserId = requestedByUserId;
        this.requestedAt = Instant.now();
        this.status = BorrowRequestStatus.PENDING;
    }

    public void approve(UUID approverId) {
        requirePending("approved");
        this.status = BorrowRequestStatus.APPROVED;
        this.approvedByUserId = approverId;
        this.approvedAt = Instant.now();
    }

    public void reject(UUID approverId) {
        requirePending("rejected");
        this.status = BorrowRequestStatus.REJECTED;
        this.approvedByUserId = approverId;
        this.approvedAt = Instant.now();
    }

    private void requirePending(String action) {
        if (status != BorrowRequestStatus.PENDING) {
            throw new BusinessRuleException("STORE_BORROW_NOT_PENDING",
                    "Only a PENDING borrow request can be " + action + " (current: " + status + ")");
        }
    }
}
