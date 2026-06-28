package com.enlear.erp.fuel.model;

import com.enlear.erp.shared.model.BaseEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Table;
import java.math.BigDecimal;
import lombok.Getter;
import lombok.NoArgsConstructor;

/**
 * A physical fuel tank. The company runs exactly two (one {@code INTERNAL},
 * one {@code VEHICLE}), seeded by the schema migration.
 *
 * <p>{@code currentLitres} is a maintained projection of how much fuel the tank
 * holds right now: refills add to it, vehicle issues subtract from it, and a
 * timed reading reconciles it to the measured value. It never goes negative.
 */
@Entity
@Table(name = "fuel_tanks", schema = "fuel")
@Getter
@NoArgsConstructor
public class FuelTank extends BaseEntity {

    @Column(nullable = false, length = 100)
    private String name;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, unique = true, length = 16)
    private FuelTankPurpose purpose;

    @Column(name = "capacity_litres", nullable = false, precision = 19, scale = 4)
    private BigDecimal capacityLitres = BigDecimal.ZERO;

    @Column(name = "current_litres", nullable = false, precision = 19, scale = 4)
    private BigDecimal currentLitres = BigDecimal.ZERO;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 16)
    private TankStatus status = TankStatus.ACTIVE;

    public FuelTank(String name, FuelTankPurpose purpose, BigDecimal capacityLitres) {
        this.name = name;
        this.purpose = purpose;
        this.capacityLitres = capacityLitres != null ? capacityLitres : BigDecimal.ZERO;
        this.currentLitres = BigDecimal.ZERO;
        this.status = TankStatus.ACTIVE;
    }

    /** Update the editable master fields (purpose and level are not touched). */
    public void updateDetails(String name, BigDecimal capacityLitres) {
        this.name = name;
        this.capacityLitres = capacityLitres != null ? capacityLitres : BigDecimal.ZERO;
    }

    /** Apply a signed change to the running level, flooring at zero. */
    public void adjustLevel(BigDecimal signedDelta) {
        BigDecimal next = currentLitres.add(signedDelta);
        this.currentLitres = next.signum() < 0 ? BigDecimal.ZERO : next;
    }

    /** Reconcile the running level to a directly measured value. */
    public void reconcileTo(BigDecimal measuredLitres) {
        this.currentLitres = measuredLitres != null ? measuredLitres : BigDecimal.ZERO;
    }
}
