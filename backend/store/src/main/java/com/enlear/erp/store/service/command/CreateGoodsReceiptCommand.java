package com.enlear.erp.store.service.command;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;
import java.util.UUID;

/** Intent to record a goods receipt (GRN) with one or more received lines. */
public record CreateGoodsReceiptCommand(
        String poNumber,
        String invoiceNumber,
        UUID supplierId,
        UUID warehouseId,
        UUID storeKeeperId,
        Instant receivedAt,
        List<Line> lines) {

    public record Line(UUID itemId, BigDecimal quantity, BigDecimal unitCost) {
    }
}
