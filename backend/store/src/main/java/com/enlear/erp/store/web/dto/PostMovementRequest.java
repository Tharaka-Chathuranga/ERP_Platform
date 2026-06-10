package com.enlear.erp.store.web.dto;

import com.enlear.erp.store.service.command.PostStockMovementCommand;
import com.enlear.erp.store.domain.MovementType;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

public record PostMovementRequest(
        @NotNull UUID itemId,
        @NotNull MovementType type,
        @NotNull @DecimalMin(value = "0.0", inclusive = false) BigDecimal quantity,
        @DecimalMin("0.0") BigDecimal unitCost,
        String reference,
        Instant occurredAt) {

    public PostStockMovementCommand toCommand() {
        return new PostStockMovementCommand(itemId, type, quantity, unitCost,
                reference, occurredAt);
    }
}
