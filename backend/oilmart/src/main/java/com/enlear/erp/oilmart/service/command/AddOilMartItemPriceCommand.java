package com.enlear.erp.oilmart.service.command;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

public record AddOilMartItemPriceCommand(
        UUID itemId,
        BigDecimal buyPrice,
        BigDecimal sellPrice,
        LocalDate effectiveFrom,
        LocalDate effectiveTo,
        UUID recordedByUserId,
        String note) {
}
