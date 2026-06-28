package com.enlear.erp.fuel.model;

import com.enlear.erp.shared.model.BaseEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Index;
import jakarta.persistence.Table;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;
import lombok.Getter;
import lombok.NoArgsConstructor;

/**
 * One entry in the fuel-price history. Each row applies from {@code effectiveFrom}
 * onward; {@code effectiveTo} is {@code null} while the row is the current price
 * and is set automatically when a later price supersedes it. Ranges do not
 * overlap, so the history is preserved for later costing.
 */
@Entity
@Table(name = "fuel_prices", schema = "fuel",
        indexes = @Index(name = "idx_fuel_prices_range", columnList = "effective_from, effective_to"))
@Getter
@NoArgsConstructor
public class FuelPrice extends BaseEntity {

    @Column(name = "unit_price", nullable = false, precision = 19, scale = 4)
    private BigDecimal unitPrice;

    @Column(name = "effective_from", nullable = false)
    private LocalDate effectiveFrom;

    @Column(name = "effective_to")
    private LocalDate effectiveTo;

    @Column(name = "recorded_by_user_id", nullable = false)
    private UUID recordedByUserId;

    @Column(length = 1000)
    private String note;

    public FuelPrice(BigDecimal unitPrice, LocalDate effectiveFrom, LocalDate effectiveTo,
                     UUID recordedByUserId, String note) {
        this.unitPrice = unitPrice;
        this.effectiveFrom = effectiveFrom;
        this.effectiveTo = effectiveTo;
        this.recordedByUserId = recordedByUserId;
        this.note = note;
    }

    /** Close this price so it stops applying on {@code endDate}, when a later price takes over. */
    public void closeOn(LocalDate endDate) {
        this.effectiveTo = endDate;
    }
}
