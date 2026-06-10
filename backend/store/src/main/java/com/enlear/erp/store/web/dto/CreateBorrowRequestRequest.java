package com.enlear.erp.store.web.dto;

import com.enlear.erp.store.service.command.CreateBorrowRequestCommand;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.math.BigDecimal;
import java.util.UUID;

public record CreateBorrowRequestRequest(
        @NotNull UUID itemId,
        @NotNull @DecimalMin(value = "0.0", inclusive = false) BigDecimal quantity,
        @Size(max = 1000) String reason,
        @NotNull UUID requestedByUserId) {

    public CreateBorrowRequestCommand toCommand() {
        return new CreateBorrowRequestCommand(itemId, quantity, reason, requestedByUserId);
    }
}
