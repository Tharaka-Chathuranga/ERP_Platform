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
 * One entry in the append-only fuel-price history. Each row carries an explicit
 * {@code [effectiveFrom, effectiveTo]} date range during which the unit price
 * applies. Rows are never updated or deleted and their ranges must not overlap,
 * so the history is preserved for later costing.
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

    @Column(name = "effective_to", nullable = false)
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
}
