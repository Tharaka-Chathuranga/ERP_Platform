package com.enlear.erp.store.domain;

import com.enlear.erp.shared.domain.BaseEntity;
import com.enlear.erp.shared.error.BusinessRuleException;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import java.math.BigDecimal;
import java.util.UUID;
import lombok.Getter;
import lombok.NoArgsConstructor;

/**
 * A single issued item within an {@link Issue}. Returnable lines track how much
 * has come back so far ({@code returnedQuantity}). Part of the Issue aggregate.
 */
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

    public IssueLine(UUID itemId, BigDecimal quantity, boolean returnable) {
        this.itemId = itemId;
        this.quantity = quantity;
        this.returnable = returnable;
        this.returnedQuantity = BigDecimal.ZERO;
    }

    /** Records a return of {@code qty} units, guarding against over-returning. */
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
