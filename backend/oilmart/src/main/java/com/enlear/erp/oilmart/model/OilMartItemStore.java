package com.enlear.erp.oilmart.model;

import com.enlear.erp.shared.error.BusinessRuleException;
import com.enlear.erp.shared.model.BaseEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "oil_mart_item_store", schema = "oilmart")
@Getter
@NoArgsConstructor
public class OilMartItemStore extends BaseEntity {

    @Column(name = "item_id", nullable = false, unique = true)
    private UUID itemId;

    @Column(name = "quantity_on_hand", nullable = false, precision = 19, scale = 4)
    private BigDecimal quantityOnHand = BigDecimal.ZERO;

    @Column(name = "last_movement_at")
    private Instant lastMovementAt;

    public OilMartItemStore(UUID itemId) {
        this.itemId = itemId;
        this.quantityOnHand = BigDecimal.ZERO;
    }

    public BigDecimal applyDelta(BigDecimal delta, String itemLabel) {
        BigDecimal next = quantityOnHand.add(delta);
        if (next.signum() < 0) {
            throw new BusinessRuleException("OILMART_INSUFFICIENT_STOCK",
                    "Insufficient stock for %s: %s L on hand, %s L required"
                            .formatted(itemLabel, quantityOnHand.toPlainString(),
                                    delta.negate().toPlainString()));
        }
        this.quantityOnHand = next;
        this.lastMovementAt = Instant.now();
        return next;
    }
}
