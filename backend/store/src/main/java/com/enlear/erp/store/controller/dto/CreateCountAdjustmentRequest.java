package com.enlear.erp.store.controller.dto;

import com.enlear.erp.store.service.command.CreateCountAdjustmentCommand;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.math.BigDecimal;
import java.util.UUID;

public record CreateCountAdjustmentRequest(
        @NotNull UUID itemId,
        @NotNull @DecimalMin("0.0") BigDecimal requestedQuantity,
        @Size(max = 1000) String reason,
        @NotNull UUID requestedByUserId) {

    public CreateCountAdjustmentCommand toCommand() {
        return new CreateCountAdjustmentCommand(itemId, requestedQuantity, reason, requestedByUserId);
    }
}
