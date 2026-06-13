package com.enlear.erp.store.model;

import com.enlear.erp.shared.model.BaseEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import java.math.BigDecimal;
import java.util.UUID;
import lombok.Getter;
import lombok.NoArgsConstructor;

/**
 * A single item line within a {@link DeviationRequest}. Part of the deviation
 * aggregate — the {@code deviation_request_id} FK column is owned by the parent's
 * {@code @OneToMany} {@code @JoinColumn}.
 */
@Entity
@Table(name = "deviation_requests_item", schema = "store")
@Getter
@NoArgsConstructor
public class DeviationRequestItem extends BaseEntity {

    @Column(name = "item_id", nullable = false)
    private UUID itemId;

    @Column(precision = 19, scale = 4)
    private BigDecimal quantity;

    public DeviationRequestItem(UUID itemId, BigDecimal quantity) {
        this.itemId = itemId;
        this.quantity = quantity;
    }
}
