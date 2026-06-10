package com.enlear.erp.store.service.command;

import java.math.BigDecimal;
import java.util.UUID;

public record AddSupplierItemCommand(
        UUID supplierId,
        UUID itemId,
        String supplierSku,
        Integer leadTimeDays,
        BigDecimal lastPurchasePrice) {
}
