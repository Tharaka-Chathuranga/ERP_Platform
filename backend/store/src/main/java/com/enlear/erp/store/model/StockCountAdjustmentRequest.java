package com.enlear.erp.store.model;

import com.enlear.erp.shared.error.BusinessRuleException;
import com.enlear.erp.shared.model.BaseEntity;
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
@Table(name = "stock_count_adjustment_requests", schema = "store")
@Getter
@NoArgsConstructor
public class StockCountAdjustmentRequest extends BaseEntity {

    @Column(name = "item_id", nullable = false)
    private UUID itemId;

    @Column(name = "current_quantity", nullable = false, precision = 19, scale = 4)
    private BigDecimal currentQuantity;

    @Column(name = "requested_quantity", nullable = false, precision = 19, scale = 4)
    private BigDecimal requestedQuantity;

    @Column(length = 1000)
    private String reason;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 16)
    private CountAdjustmentStatus status = CountAdjustmentStatus.PENDING;

    @Column(name = "requested_by_user_id", nullable = false)
    private UUID requestedByUserId;

    @Column(name = "requested_at", nullable = false)
    private Instant requestedAt;

    @Column(name = "approved_by_user_id")
    private UUID approvedByUserId;

    @Column(name = "approved_at")
    private Instant approvedAt;

    public StockCountAdjustmentRequest(UUID itemId, BigDecimal currentQuantity,
                                       BigDecimal requestedQuantity, String reason,
                                       UUID requestedByUserId) {
        this.itemId = itemId;
        this.currentQuantity = currentQuantity;
        this.requestedQuantity = requestedQuantity;
        this.reason = reason;
        this.requestedByUserId = requestedByUserId;
        this.requestedAt = Instant.now();
        this.status = CountAdjustmentStatus.PENDING;
    }

    public void approve(UUID approverId) {
        requirePending("approved");
        this.status = CountAdjustmentStatus.APPROVED;
        this.approvedByUserId = approverId;
        this.approvedAt = Instant.now();
    }

    public void reject(UUID approverId) {
        requirePending("rejected");
        this.status = CountAdjustmentStatus.REJECTED;
        this.approvedByUserId = approverId;
        this.approvedAt = Instant.now();
    }

    private void requirePending(String action) {
        if (status != CountAdjustmentStatus.PENDING) {
            throw new BusinessRuleException("STORE_COUNT_ADJUSTMENT_NOT_PENDING",
                    "Only a PENDING count adjustment request can be " + action
                            + " (current: " + status + ")");
        }
    }
}
