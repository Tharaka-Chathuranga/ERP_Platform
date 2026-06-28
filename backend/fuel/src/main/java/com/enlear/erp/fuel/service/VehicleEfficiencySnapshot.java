package com.enlear.erp.fuel.service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

/** Computed fuel efficiency for one vehicle over a date range. */
public record VehicleEfficiencySnapshot(
        UUID vehicleId,
        String vehicleNumber,
        UUID driverUserId,
        List<EfficiencyPoint> points) {

    /**
     * One km/L data point, attributed to the date of the second fill in the pair.
     *
     * <p>Formula:
     * <pre>
     *   litresConsumed = prev.reading + prev.litresIssued − curr.reading
     *   kmDriven       = curr.odometer − prev.odometer
     *   kmPerLitre     = kmDriven / litresConsumed
     * </pre>
     */
    public record EfficiencyPoint(
            LocalDate date,
            BigDecimal kmPerLitre,
            BigDecimal kmDriven,
            BigDecimal litresConsumed) {
    }
}
