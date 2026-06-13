package com.enlear.erp.store.controller.dto;

import com.enlear.erp.store.service.command.AddSupplierItemCommand;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;
import java.math.BigDecimal;
import java.util.UUID;

public record AddSupplierItemRequest(
        @NotNull UUID itemId,
        @Size(max = 64) String supplierSku,
        @Positive Integer leadTimeDays,
        @DecimalMin("0.0") BigDecimal lastPurchasePrice) {

    public AddSupplierItemCommand toCommand(UUID supplierId) {
        return new AddSupplierItemCommand(supplierId, itemId, supplierSku, leadTimeDays,
                lastPurchasePrice);
    }
}
