package com.enlear.erp.fuel.exposed.dto;

import java.math.BigDecimal;
import java.time.LocalDate;

/** Read-only view of the fuel price effective on a date. */
public record FuelPriceView(BigDecimal unitPrice, LocalDate effectiveFrom, LocalDate effectiveTo) {
}
