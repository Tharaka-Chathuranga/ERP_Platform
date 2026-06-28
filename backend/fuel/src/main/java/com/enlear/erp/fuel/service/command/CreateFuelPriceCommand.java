package com.enlear.erp.fuel.service.command;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

/** Intent to append a dated fuel price to the history. */
public record CreateFuelPriceCommand(
        BigDecimal unitPrice,
        LocalDate effectiveFrom,
        LocalDate effectiveTo,
        UUID recordedByUserId,
        String note) {
}
