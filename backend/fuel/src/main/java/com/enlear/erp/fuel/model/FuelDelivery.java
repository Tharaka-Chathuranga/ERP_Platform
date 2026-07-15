package com.enlear.erp.fuel.model;

import com.enlear.erp.shared.model.BaseEntity;
import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Index;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import lombok.Getter;
import lombok.NoArgsConstructor;

/**
 * A single supplier delivery of fuel, recorded the way the station records it
 * on paper. It carries the ordered quantity, the discharge timing and one
 * {@link FuelDeliveryLine} per tank the fuel was discharged into.
 *
 * <p>{@code deliveredLitres} is the sum of the lines and is the quantity that
 * actually moves the tank levels; keeping it beside {@code orderedLitres} makes
 * the over/short-delivery variance a first-class, queryable figure.
 */
@Entity
@Table(name = "fuel_deliveries", schema = "fuel",
        indexes = @Index(name = "idx_fuel_deliveries_delivered_on", columnList = "delivered_on"))
@Getter
@NoArgsConstructor
public class FuelDelivery extends BaseEntity {

    @Column(name = "delivery_reference", nullable = false, unique = true, length = 32)
    private String deliveryReference;

    @Column(name = "supplier_name", length = 200)
    private String supplierName;

    @Column(name = "ordered_litres", nullable = false, precision = 19, scale = 4)
    private BigDecimal orderedLitres;

    @Column(name = "delivered_litres", nullable = false, precision = 19, scale = 4)
    private BigDecimal deliveredLitres = BigDecimal.ZERO;

    @Column(name = "delivered_on", nullable = false)
    private LocalDate deliveredOn;

    @Column(name = "discharge_started_at")
    private Instant dischargeStartedAt;

    @Column(name = "discharge_finished_at")
    private Instant dischargeFinishedAt;

    @Column(name = "recorded_by_user_id", nullable = false)
    private UUID recordedByUserId;

    @Column(length = 1000)
    private String note;

    @OneToMany(cascade = CascadeType.ALL, orphanRemoval = true)
    @JoinColumn(name = "fuel_delivery_id", nullable = false)
    private List<FuelDeliveryLine> lines = new ArrayList<>();

    public FuelDelivery(String deliveryReference, String supplierName, BigDecimal orderedLitres,
                        LocalDate deliveredOn, Instant dischargeStartedAt, Instant dischargeFinishedAt,
                        UUID recordedByUserId, String note) {
        this.deliveryReference = deliveryReference;
        this.supplierName = supplierName;
        this.orderedLitres = orderedLitres;
        this.deliveredOn = deliveredOn;
        this.dischargeStartedAt = dischargeStartedAt;
        this.dischargeFinishedAt = dischargeFinishedAt;
        this.recordedByUserId = recordedByUserId;
        this.note = note;
    }

    /** Add a tank line and keep {@code deliveredLitres} in step with the sum of the lines. */
    public void addLine(FuelDeliveryLine line) {
        lines.add(line);
        this.deliveredLitres = this.deliveredLitres.add(line.getLitresDelivered());
    }

    /**
     * {@code deliveredLitres - orderedLitres}: positive when the supplier over-delivered,
     * negative when the delivery fell short of what was ordered.
     */
    public BigDecimal orderedVsDeliveredVariance() {
        return deliveredLitres.subtract(orderedLitres);
    }
}
