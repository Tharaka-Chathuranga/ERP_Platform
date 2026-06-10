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
 * A request to deviate from standard handling for an item, moving through stages
 * (INCOMING → IN_PROGRESS → FINAL) and an approval status.
 */
@Entity
@Table(name = "deviation_requests", schema = "store")
@Getter
@NoArgsConstructor
public class DeviationRequest extends BaseEntity {

    @Column(name = "item_id", nullable = false)
    private UUID itemId;

    @Column(precision = 19, scale = 4)
    private BigDecimal quantity;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 16)
    private DeviationStatus status = DeviationStatus.PENDING;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 16)
    private DeviationStage stage = DeviationStage.INCOMING;

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

    public DeviationRequest(UUID itemId, BigDecimal quantity, String reason, UUID requestedByUserId) {
        this.itemId = itemId;
        this.quantity = quantity;
        this.reason = reason;
        this.requestedByUserId = requestedByUserId;
        this.requestedAt = Instant.now();
        this.status = DeviationStatus.PENDING;
        this.stage = DeviationStage.INCOMING;
    }

    public void advanceTo(DeviationStage newStage) {
        if (newStage.ordinal() <= stage.ordinal()) {
            throw new BusinessRuleException("STORE_DEVIATION_STAGE_BACKWARDS",
                    "Cannot move deviation from " + stage + " back to " + newStage);
        }
        this.stage = newStage;
    }

    public void approve(UUID approverId) {
        requirePending("approved");
        this.status = DeviationStatus.APPROVED;
        this.approvedByUserId = approverId;
        this.approvedAt = Instant.now();
    }

    public void reject(UUID approverId) {
        requirePending("rejected");
        this.status = DeviationStatus.REJECTED;
        this.approvedByUserId = approverId;
        this.approvedAt = Instant.now();
    }

    private void requirePending(String action) {
        if (status != DeviationStatus.PENDING) {
            throw new BusinessRuleException("STORE_DEVIATION_NOT_PENDING",
                    "Only a PENDING deviation can be " + action + " (current: " + status + ")");
        }
    }
}
