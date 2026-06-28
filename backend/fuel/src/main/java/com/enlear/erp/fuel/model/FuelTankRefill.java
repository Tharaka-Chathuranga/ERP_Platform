package com.enlear.erp.fuel.model;

import com.enlear.erp.shared.model.BaseEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Index;
import jakarta.persistence.Table;
import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;
import lombok.Getter;
import lombok.NoArgsConstructor;

/** A delivery of fuel into a tank. Adds to the tank's running level. */
@Entity
@Table(name = "fuel_tank_refills", schema = "fuel",
        indexes = {
                @Index(name = "idx_fuel_refills_tank", columnList = "tank_id"),
                @Index(name = "idx_fuel_refills_refilled", columnList = "refilled_at")
        })
@Getter
@NoArgsConstructor
public class FuelTankRefill extends BaseEntity {

    @Column(name = "tank_id", nullable = false)
    private UUID tankId;

    @Column(nullable = false, precision = 19, scale = 4)
    private BigDecimal litres;

    @Column(name = "refilled_at", nullable = false)
    private Instant refilledAt;

    @Column(name = "recorded_by_user_id", nullable = false)
    private UUID recordedByUserId;

    @Column(length = 1000)
    private String note;

    public FuelTankRefill(UUID tankId, BigDecimal litres, Instant refilledAt,
                          UUID recordedByUserId, String note) {
        this.tankId = tankId;
        this.litres = litres;
        this.refilledAt = refilledAt != null ? refilledAt : Instant.now();
        this.recordedByUserId = recordedByUserId;
        this.note = note;
    }
}
