package com.enlear.erp.store.service.command;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;
import java.util.UUID;

public record CreateReceivalCommand(
        String poNumber,
        String invoiceNumber,
        UUID supplierId,
        String supplierName,
        boolean allReceivedForPo,
        UUID storeKeeperId,
        Instant receivedAt,
        List<ReceivalItem> receivalItems) {

    public record ReceivalItem(UUID itemId, BigDecimal quantity, BigDecimal unitCost,
                               String rack, String row, String column) {
    }
}
