package com.enlear.erp.fuel.service.command;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

/**
 * Intent to record a supplier fuel delivery: the ordered quantity and discharge
 * timing, plus one {@link Line} per tank the fuel was discharged into.
 */
public record RecordFuelDeliveryCommand(
        String supplierName,
        BigDecimal orderedLitres,
        LocalDate deliveredOn,
        Instant dischargeStartedAt,
        Instant dischargeFinishedAt,
        UUID recordedByUserId,
        String note,
        List<Line> lines) {

    /** One tank's share of the delivery, with its dip readings. */
    public record Line(
            UUID tankId,
            BigDecimal litresDelivered,
            BigDecimal dipBeforeLitres,
            BigDecimal dipAfterLitres) {
    }
}
