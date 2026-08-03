package com.enlear.erp.oilmart.service.command;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;
import java.util.UUID;

public record RecordOilMartReceiptCommand(
        UUID supplierId,
        String referenceNo,
        Instant receivedAt,
        String note,
        List<Line> lines) {

    public record Line(UUID itemId, BigDecimal quantityLitres, BigDecimal buyUnitPrice) {
    }
}
