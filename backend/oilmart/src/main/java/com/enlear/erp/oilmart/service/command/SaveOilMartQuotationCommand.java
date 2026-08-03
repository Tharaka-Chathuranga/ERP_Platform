package com.enlear.erp.oilmart.service.command;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

public record SaveOilMartQuotationCommand(
        UUID clientId,
        LocalDate issuedDate,
        LocalDate validUntil,
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
