package com.enlear.erp.store.web.dto;

import com.enlear.erp.store.service.command.CreateDeviationRequestCommand;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.math.BigDecimal;
import java.util.UUID;

public record CreateDeviationRequestRequest(
        @NotNull UUID itemId,
        @DecimalMin("0.0") BigDecimal quantity,
        @Size(max = 1000) String reason,
        @NotNull UUID requestedByUserId) {

    public CreateDeviationRequestCommand toCommand() {
        return new CreateDeviationRequestCommand(itemId, quantity, reason, requestedByUserId);
    }
}
