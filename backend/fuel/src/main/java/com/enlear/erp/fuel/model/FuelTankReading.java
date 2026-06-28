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

/**
 * A timed measurement of how much fuel a tank holds (e.g. the internal tank at
 * 8am / 8pm). Consumption between two readings is derived as
 * {@code earlier.litres + refills in between - later.litres}.
 */
@Entity
@Table(name = "fuel_tank_readings", schema = "fuel",
        indexes = @Index(name = "idx_fuel_readings_tank_time", columnList = "tank_id, reading_at"))
@Getter
@NoArgsConstructor
public class FuelTankReading extends BaseEntity {

    @Column(name = "tank_id", nullable = false)
    private UUID tankId;

    @Column(name = "litres_measured", nullable = false, precision = 19, scale = 4)
    private BigDecimal litresMeasured;

    @Column(name = "reading_at", nullable = false)
    private Instant readingAt;

    @Column(name = "recorded_by_user_id", nullable = false)
    private UUID recordedByUserId;

    @Column(length = 1000)
    private String note;

    public FuelTankReading(UUID tankId, BigDecimal litresMeasured, Instant readingAt,
                           UUID recordedByUserId, String note) {
        this.tankId = tankId;
        this.litresMeasured = litresMeasured;
        this.readingAt = readingAt != null ? readingAt : Instant.now();
        this.recordedByUserId = recordedByUserId;
        this.note = note;
    }
}
