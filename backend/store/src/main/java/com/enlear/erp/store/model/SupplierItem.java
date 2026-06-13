package com.enlear.erp.store.model;

import com.enlear.erp.shared.model.BaseEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import java.math.BigDecimal;
import java.util.UUID;
import lombok.Getter;
import lombok.NoArgsConstructor;

/**
 * Link between a {@link Supplier} and an {@link Item} they supply, carrying the
 * sourcing data for that pairing. References are stored as ids (consistent with
 * the rest of the module), not JPA relations.
 */
@Entity
@Table(name = "supplier_items", schema = "store",
        uniqueConstraints = @UniqueConstraint(name = "uq_supplier_item",
                columnNames = {"supplier_id", "item_id"}))
@Getter
@NoArgsConstructor
public class SupplierItem extends BaseEntity {

    @Column(name = "supplier_id", nullable = false)
    private UUID supplierId;

    @Column(name = "item_id", nullable = false)
    private UUID itemId;

    @Column(name = "supplier_sku", length = 64)
    private String supplierSku;

    @Column(name = "lead_time_days")
    private Integer leadTimeDays;

    @Column(name = "last_purchase_price", precision = 19, scale = 4)
    private BigDecimal lastPurchasePrice;

    public SupplierItem(UUID supplierId, UUID itemId, String supplierSku,
                        Integer leadTimeDays, BigDecimal lastPurchasePrice) {
        this.supplierId = supplierId;
        this.itemId = itemId;
        this.supplierSku = supplierSku;
        this.leadTimeDays = leadTimeDays;
        this.lastPurchasePrice = lastPurchasePrice;
    }
}
