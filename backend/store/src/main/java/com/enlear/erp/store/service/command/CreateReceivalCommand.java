package com.enlear.erp.store.service.command;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;
import java.util.UUID;

/**
 * Intent to record a receival. The supplier is either registered
 * ({@code supplierId}) or unregistered ({@code supplierName}) — exactly one.
 * {@code allReceivedForPo} is only meaningful when {@code poNumber} is present.
 */
public record CreateReceivalCommand(
        String poNumber,
        String invoiceNumber,
        UUID supplierId,
        String supplierName,
        boolean allReceivedForPo,
        UUID storeKeeperId,
        Instant receivedAt,
        List<Line> lines) {

    public record Line(UUID itemId, BigDecimal quantity, BigDecimal unitCost) {
    }
}
