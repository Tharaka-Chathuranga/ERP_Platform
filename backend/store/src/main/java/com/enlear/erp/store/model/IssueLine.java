package com.enlear.erp.store.model;

import com.enlear.erp.shared.model.BaseEntity;
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

@Entity
@Table(name = "issues_item", schema = "store")
@Getter
@NoArgsConstructor
public class IssueLine extends BaseEntity {

    @Column(name = "item_id", nullable = false)
    private UUID itemId;

    @Column(nullable = false, precision = 19, scale = 4)
    private BigDecimal quantity;

    @Column(name = "is_returnable", nullable = false)
    private boolean returnable = false;

    @Column(name = "returned_quantity", nullable = false, precision = 19, scale = 4)
    private BigDecimal returnedQuantity = BigDecimal.ZERO;

    @Enumerated(EnumType.STRING)
    @Column(name = "approval_status", nullable = false, length = 20)
    private IssueLineStatus approvalStatus = IssueLineStatus.APPROVED;

    @Column(name = "approved_by_user_id")
    private UUID approvedByUserId;

    @Column(name = "approved_at")
    private Instant approvedAt;

    public IssueLine(UUID itemId, BigDecimal quantity, boolean returnable,
                     boolean requiresApproval) {
        this.itemId = itemId;
        this.quantity = quantity;
        this.returnable = returnable;
        this.returnedQuantity = BigDecimal.ZERO;
        this.approvalStatus = requiresApproval ? IssueLineStatus.PENDING : IssueLineStatus.APPROVED;
    }

    public void approve(UUID approverId) {
        approve(approverId, null);
    }

    public void approve(UUID approverId, BigDecimal approvedQuantity) {
        if (approvedQuantity != null) {
            if (approvedQuantity.signum() <= 0) {
                throw new BusinessRuleException("STORE_LINE_QTY_INVALID",
                        "Approved quantity must be greater than zero");
            }
            this.quantity = approvedQuantity;
        }
        decide(IssueLineStatus.APPROVED, approverId);
    }

    public void reject(UUID approverId) {
        decide(IssueLineStatus.REJECTED, approverId);
    }

    private void decide(IssueLineStatus decision, UUID approverId) {
        if (approvalStatus != IssueLineStatus.PENDING) {
            throw new BusinessRuleException("STORE_LINE_NOT_PENDING",
                    "Only a PENDING line can be decided (current: " + approvalStatus + ")");
        }
        this.approvalStatus = decision;
        this.approvedByUserId = approverId;
        this.approvedAt = Instant.now();
    }

    public boolean isApproved() {
        return approvalStatus == IssueLineStatus.APPROVED;
    }

    public boolean isPending() {
        return approvalStatus == IssueLineStatus.PENDING;
    }

    public void recordReturn(BigDecimal qty) {
        if (!returnable) {
            throw new BusinessRuleException("STORE_LINE_NOT_RETURNABLE",
                    "Item " + itemId + " was not issued as returnable");
        }
        BigDecimal next = returnedQuantity.add(qty);
        if (next.compareTo(quantity) > 0) {
            throw new BusinessRuleException("STORE_RETURN_EXCEEDS_ISSUED",
                    "Return of %s exceeds outstanding issued quantity".formatted(qty));
        }
        this.returnedQuantity = next;
    }
}
