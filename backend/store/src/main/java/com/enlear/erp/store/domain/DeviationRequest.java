package com.enlear.erp.store.domain;

import com.enlear.erp.shared.domain.BaseEntity;
import com.enlear.erp.shared.error.BusinessRuleException;
import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import java.math.BigDecimal;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import lombok.Getter;
import lombok.NoArgsConstructor;

/**
 * A multi-item request to deviate from standard handling, moving through stages
 * (INCOMING → IN_PROGRESS → FINAL) and an approval status. Header + item lines.
 */
@Entity
@Table(name = "deviation_requests", schema = "store")
@Getter
@NoArgsConstructor
public class DeviationRequest extends BaseEntity {

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

    @OneToMany(cascade = CascadeType.ALL, orphanRemoval = true)
    @JoinColumn(name = "deviation_request_id", nullable = false)
    private List<DeviationRequestItem> items = new ArrayList<>();

    public DeviationRequest(String reason, UUID requestedByUserId) {
        this.reason = reason;
        this.requestedByUserId = requestedByUserId;
        this.requestedAt = Instant.now();
        this.status = DeviationStatus.PENDING;
        this.stage = DeviationStage.INCOMING;
    }

    public void addItem(UUID itemId, BigDecimal quantity) {
        items.add(new DeviationRequestItem(itemId, quantity));
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
