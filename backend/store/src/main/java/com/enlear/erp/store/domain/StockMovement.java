package com.enlear.erp.store.domain;

import com.enlear.erp.shared.domain.BaseEntity;
import com.enlear.erp.store.domain.MovementType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Index;
import jakarta.persistence.Table;
import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;
import lombok.Getter;
import lombok.NoArgsConstructor;

/**
 * An <b>immutable</b> ledger entry describing a single change in stock. This is
 * the source of truth for inventory: stock levels are a projection derived from
 * the sum of movements. Movements are never updated or deleted — corrections
 * are made by recording a compensating movement, preserving a full audit trail.
 *
 * <p>{@code quantity} is always stored as a positive magnitude; the
 * {@link MovementType#direction()} determines its effect on on-hand stock.
 */
@Entity
@Table(name = "stock_movements", schema = "store",
        indexes = {
                @Index(name = "idx_movement_item_wh", columnList = "item_id, warehouse_id"),
                @Index(name = "idx_movement_occurred", columnList = "occurred_at")
        })
@Getter
@NoArgsConstructor
public class StockMovement extends BaseEntity {

    @Column(name = "item_id", nullable = false)
    private UUID itemId;

    @Column(name = "warehouse_id", nullable = false)
    private UUID warehouseId;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 32)
    private MovementType type;

    /** Positive magnitude; effect on stock = quantity * type.direction(). */
    @Column(nullable = false, precision = 19, scale = 4)
    private BigDecimal quantity;

    /** Unit cost at the time of the movement (nullable for issues under some valuation methods). */
    @Column(name = "unit_cost", precision = 19, scale = 4)
    private BigDecimal unitCost;

    /** External reference, e.g. a purchase order or sales order number. */
    @Column(length = 100)
    private String reference;

    @Column(length = 500)
    private String note;

    @Column(name = "occurred_at", nullable = false)
    private Instant occurredAt;

    public StockMovement(UUID itemId, UUID warehouseId, MovementType type, BigDecimal quantity,
                         BigDecimal unitCost, String reference, String note, Instant occurredAt) {
        this.itemId = itemId;
        this.warehouseId = warehouseId;
        this.type = type;
        this.quantity = quantity;
        this.unitCost = unitCost;
        this.reference = reference;
        this.note = note;
        this.occurredAt = occurredAt != null ? occurredAt : Instant.now();
    }

    /** Signed effect of this movement on on-hand quantity. */
    public BigDecimal signedQuantity() {
        return quantity.multiply(BigDecimal.valueOf(type.direction()));
    }
}
