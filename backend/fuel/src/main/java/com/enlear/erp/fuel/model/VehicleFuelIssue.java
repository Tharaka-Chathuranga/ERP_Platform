package com.enlear.erp.fuel.model;

import com.enlear.erp.shared.error.BusinessRuleException;
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

/**
 * A single fuelling of a vehicle from the vehicle tank. The issued litres are
 * capped at how much the vehicle can still take ({@code fullTankCapacity -
 * vehicleReadingBeforeIssue}); the default fills the tank completely.
 */
@Entity
@Table(name = "vehicle_fuel_issues", schema = "fuel",
        indexes = {
                @Index(name = "idx_vehicle_issues_vehicle", columnList = "vehicle_id"),
                @Index(name = "idx_vehicle_issues_issued", columnList = "issued_at")
        })
@Getter
@NoArgsConstructor
public class VehicleFuelIssue extends BaseEntity {

    @Column(name = "vehicle_id", nullable = false)
    private UUID vehicleId;

    @Column(name = "vehicle_reading_before_issue_litres", nullable = false, precision = 19, scale = 4)
    private BigDecimal vehicleReadingBeforeIssueLitres;

    @Column(name = "litres_issued", nullable = false, precision = 19, scale = 4)
    private BigDecimal litresIssued;

    @Column(name = "issuing_user_id", nullable = false)
    private UUID issuingUserId;

    @Column(name = "receiving_user_id", nullable = false)
    private UUID receivingUserId;

    @Column(name = "issued_at", nullable = false)
    private Instant issuedAt;

    /** Odometer reading at the time of fuelling (km). Nullable — not always recorded. */
    @Column(name = "odometer_reading_km", precision = 10, scale = 2)
    private BigDecimal odometerReadingKm;

    public VehicleFuelIssue(UUID vehicleId, BigDecimal vehicleReadingBeforeIssueLitres,
                            BigDecimal litresIssued, UUID issuingUserId, UUID receivingUserId,
                            Instant issuedAt, BigDecimal odometerReadingKm) {
        this.vehicleId = vehicleId;
        this.vehicleReadingBeforeIssueLitres = vehicleReadingBeforeIssueLitres;
        this.litresIssued = litresIssued;
        this.issuingUserId = issuingUserId;
        this.receivingUserId = receivingUserId;
        this.issuedAt = issuedAt != null ? issuedAt : Instant.now();
        this.odometerReadingKm = odometerReadingKm;
    }

    /**
     * Enforce the core invariant: a positive amount that does not overfill the
     * vehicle ({@code reading + issued <= capacity}).
     */
    public static void validateFill(BigDecimal fullTankCapacityLitres,
                                    BigDecimal vehicleReadingBeforeIssueLitres,
                                    BigDecimal litresIssued) {
        if (litresIssued == null || litresIssued.signum() <= 0) {
            throw new BusinessRuleException("FUEL_INVALID_ISSUE_QUANTITY",
                    "Issued litres must be a positive number");
        }
        if (vehicleReadingBeforeIssueLitres == null || vehicleReadingBeforeIssueLitres.signum() < 0) {
            throw new BusinessRuleException("FUEL_INVALID_VEHICLE_READING",
                    "Vehicle reading must be zero or more");
        }
        if (vehicleReadingBeforeIssueLitres.compareTo(fullTankCapacityLitres) > 0) {
            throw new BusinessRuleException("FUEL_READING_EXCEEDS_CAPACITY",
                    "Vehicle reading %s exceeds its tank capacity %s"
                            .formatted(vehicleReadingBeforeIssueLitres, fullTankCapacityLitres));
        }
        BigDecimal headroom = fullTankCapacityLitres.subtract(vehicleReadingBeforeIssueLitres);
        if (litresIssued.compareTo(headroom) > 0) {
            throw new BusinessRuleException("FUEL_OVERFILL",
                    "Cannot issue %s L: the vehicle can take at most %s L (capacity %s, current %s)"
                            .formatted(litresIssued, headroom, fullTankCapacityLitres,
                                    vehicleReadingBeforeIssueLitres));
        }
    }
}
