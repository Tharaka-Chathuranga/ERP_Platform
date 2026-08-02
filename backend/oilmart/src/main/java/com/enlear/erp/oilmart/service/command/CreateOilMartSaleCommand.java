package com.enlear.erp.oilmart.service.command;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

public record CreateOilMartSaleCommand(
        UUID clientId,
        Instant quotedAt,
        LocalDate validUntil,
        BigDecimal discountAmount,
        String note,
        List<Line> lines) {

    public record Line(
            UUID itemId,
            BigDecimal quantityLitres,
            BigDecimal listUnitPrice,
            BigDecimal unitPrice,
            BigDecimal discountPercent) {
    }
}
