package com.enlear.erp.store.domain;

import com.enlear.erp.shared.domain.BaseEntity;
import com.enlear.erp.shared.error.BusinessRuleException;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Table;
import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;
import lombok.Getter;
import lombok.NoArgsConstructor;

/**
 * A user's request to borrow a quantity of an item. Once APPROVED it can be
 * fulfilled by an {@link Issue} (referenced by {@code issueId}).
 */
@Entity
@Table(name = "borrow_requests", schema = "store")
@Getter
@NoArgsConstructor
public class BorrowRequest extends BaseEntity {

    @Column(name = "item_id", nullable = false)
    private UUID itemId;

    @Column(nullable = false, precision = 19, scale = 4)
    private BigDecimal quantity;

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

    @Column(name = "issue_id")
    private UUID issueId;

    public BorrowRequest(UUID itemId, BigDecimal quantity, String reason, UUID requestedByUserId) {
        this.itemId = itemId;
        this.quantity = quantity;
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

    /** Links the fulfilling issue and flips the request to ISSUED. */
    public void fulfil(UUID issueId) {
        if (status != BorrowRequestStatus.APPROVED) {
            throw new BusinessRuleException("STORE_BORROW_NOT_APPROVED",
                    "Only an APPROVED borrow request can be fulfilled (current: " + status + ")");
        }
        this.issueId = issueId;
        this.status = BorrowRequestStatus.ISSUED;
    }

    private void requirePending(String action) {
        if (status != BorrowRequestStatus.PENDING) {
            throw new BusinessRuleException("STORE_BORROW_NOT_PENDING",
                    "Only a PENDING borrow request can be " + action + " (current: " + status + ")");
        }
    }
}
