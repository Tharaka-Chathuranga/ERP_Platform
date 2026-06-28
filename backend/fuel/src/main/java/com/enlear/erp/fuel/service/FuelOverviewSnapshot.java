package com.enlear.erp.fuel.service;

import com.enlear.erp.fuel.model.FuelPrice;
import com.enlear.erp.fuel.model.FuelTank;
import java.math.BigDecimal;
import java.util.List;

/** Aggregated figures for the admin overview's fuel section. */
public record FuelOverviewSnapshot(
        List<FuelTank> tanks,
        long todayIssueCount,
        BigDecimal todayLitres,
        FuelPrice currentPrice,
        ReadingWithConsumption lastInternalReading) {
}
