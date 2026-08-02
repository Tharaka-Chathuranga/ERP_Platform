package com.enlear.erp.oilmart.model;

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
@Table(name = "oil_mart_stock_movements", schema = "oilmart")
@Getter
@NoArgsConstructor
public class OilMartStockMovement extends BaseEntity {

    @Column(name = "item_id", nullable = false)
    private UUID itemId;

    @Enumerated(EnumType.STRING)
    @Column(name = "movement_type", nullable = false, length = 16)
    private OilMartMovementType movementType;

    @Column(name = "quantity_delta", nullable = false, precision = 19, scale = 4)
    private BigDecimal quantityDelta;

    @Column(name = "balance_after", nullable = false, precision = 19, scale = 4)
    private BigDecimal balanceAfter;

    @Enumerated(EnumType.STRING)
    @Column(name = "reference_type", nullable = false, length = 16)
    private OilMartMovementReferenceType referenceType;

    @Column(name = "reference_id")
    private UUID referenceId;

    @Column(name = "reference_no", length = 64)
    private String referenceNo;

    @Column(name = "moved_at", nullable = false)
    private Instant movedAt;

    @Column(name = "moved_by_user_id", nullable = false)
    private UUID movedByUserId;

    @Column(length = 1000)
    private String note;

    public OilMartStockMovement(UUID itemId, OilMartMovementType movementType,
                                BigDecimal quantityDelta, BigDecimal balanceAfter,
                                OilMartMovementReferenceType referenceType, UUID referenceId,
                                String referenceNo, UUID movedByUserId, String note) {
        this.itemId = itemId;
        this.movementType = movementType;
        this.quantityDelta = quantityDelta;
        this.balanceAfter = balanceAfter;
        this.referenceType = referenceType;
        this.referenceId = referenceId;
        this.referenceNo = referenceNo;
        this.movedAt = Instant.now();
        this.movedByUserId = movedByUserId;
        this.note = note;
    }
}
