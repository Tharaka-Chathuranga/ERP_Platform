package com.enlear.erp.fuel.model;

import com.enlear.erp.shared.model.BaseEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Index;
import jakarta.persistence.Table;
import java.math.BigDecimal;
import java.util.UUID;
import lombok.Getter;
import lombok.NoArgsConstructor;

/**
 * One tank's share of a {@link FuelDelivery}: the litres discharged into that
 * tank plus the dip-stick readings taken before and after discharge.
 *
 * <p>The dip readings are a physical reconciliation control. In a clean
 * delivery {@code dipBefore + litresDelivered == dipAfter}; the residual
 * {@link #dipReconciliationVariance()} exposes measurement error, spillage or
 * loss. It is derived, never persisted.
 */
@Entity
@Table(name = "fuel_delivery_lines", schema = "fuel",
        indexes = {
                @Index(name = "idx_fuel_delivery_lines_delivery", columnList = "fuel_delivery_id"),
                @Index(name = "idx_fuel_delivery_lines_tank", columnList = "tank_id")
        })
@Getter
@NoArgsConstructor
public class FuelDeliveryLine extends BaseEntity {

    @Column(name = "tank_id", nullable = false)
    private UUID tankId;

    @Column(name = "litres_delivered", nullable = false, precision = 19, scale = 4)
    private BigDecimal litresDelivered;

    @Column(name = "dip_before_litres", precision = 19, scale = 4)
    private BigDecimal dipBeforeLitres;

    @Column(name = "dip_after_litres", precision = 19, scale = 4)
    private BigDecimal dipAfterLitres;

    public FuelDeliveryLine(UUID tankId, BigDecimal litresDelivered,
                            BigDecimal dipBeforeLitres, BigDecimal dipAfterLitres) {
        this.tankId = tankId;
        this.litresDelivered = litresDelivered;
        this.dipBeforeLitres = dipBeforeLitres;
        this.dipAfterLitres = dipAfterLitres;
    }

    /**
     * {@code dipAfter - dipBefore - litresDelivered}: how far the physical dip
     * readings disagree with the delivered quantity. Zero when they reconcile;
     * {@code null} when either dip reading was not recorded.
     */
    public BigDecimal dipReconciliationVariance() {
        if (dipBeforeLitres == null || dipAfterLitres == null) {
            return null;
        }
        return dipAfterLitres.subtract(dipBeforeLitres).subtract(litresDelivered);
    }
}
