package com.enlear.erp.store.domain;

import com.enlear.erp.shared.domain.BaseEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import java.math.BigDecimal;
import java.util.UUID;
import lombok.Getter;
import lombok.NoArgsConstructor;

/**
 * A single received item within a {@link Receival}. Part of the receival
 * aggregate — created and persisted via its parent (the FK column
 * {@code item_receival_id} is owned by the parent's {@code @OneToMany}).
 */
@Entity
@Table(name = "item_receival_item", schema = "store")
@Getter
@NoArgsConstructor
public class ReceivalItem extends BaseEntity {

    @Column(name = "item_id", nullable = false)
    private UUID itemId;

    @Column(nullable = false, precision = 19, scale = 4)
    private BigDecimal quantity;

    @Column(name = "unit_cost", precision = 19, scale = 4)
    private BigDecimal unitCost;

    public ReceivalItem(UUID itemId, BigDecimal quantity, BigDecimal unitCost) {
        this.itemId = itemId;
        this.quantity = quantity;
        this.unitCost = unitCost;
    }
}
