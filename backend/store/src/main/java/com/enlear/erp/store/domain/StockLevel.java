package com.enlear.erp.store.domain;

import com.enlear.erp.shared.domain.BaseEntity;
import com.enlear.erp.shared.error.BusinessRuleException;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import java.math.BigDecimal;
import java.util.UUID;
import lombok.Getter;
import lombok.NoArgsConstructor;

/**
 * The current on-hand quantity for an item at a warehouse — a <b>projection</b>
 * maintained in the same transaction as each {@link StockMovement}, so reads are
 * fast and consistent. The {@code @Version} field on {@link BaseEntity} guards
 * against lost updates when two movements hit the same item/warehouse at once.
 */
@Entity
@Table(name = "stock_levels", schema = "store",
        uniqueConstraints = @UniqueConstraint(name = "uq_stock_item_wh",
                columnNames = {"item_id", "warehouse_id"}))
@Getter
@NoArgsConstructor
public class StockLevel extends BaseEntity {

    @Column(name = "item_id", nullable = false)
    private UUID itemId;

    @Column(name = "warehouse_id", nullable = false)
    private UUID warehouseId;

    @Column(name = "quantity_on_hand", nullable = false, precision = 19, scale = 4)
    private BigDecimal quantityOnHand = BigDecimal.ZERO;

    public StockLevel(UUID itemId, UUID warehouseId) {
        this.itemId = itemId;
        this.warehouseId = warehouseId;
        this.quantityOnHand = BigDecimal.ZERO;
    }

    /**
     * Applies a signed quantity delta, enforcing the core invariant that stock
     * may never go negative.
     *
     * @throws BusinessRuleException if the resulting quantity would be negative
     */
    public void apply(BigDecimal signedDelta) {
        BigDecimal next = quantityOnHand.add(signedDelta);
        if (next.signum() < 0) {
            throw new BusinessRuleException("STORE_INSUFFICIENT_STOCK",
                    "Insufficient stock: on hand %s, requested change %s"
                            .formatted(quantityOnHand, signedDelta));
        }
        this.quantityOnHand = next;
    }
}
