package com.enlear.erp.store.controller.dto;

import com.enlear.erp.store.service.command.CreateDeviationRequestCommand;
import jakarta.validation.Valid;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

public record CreateDeviationRequestRequest(
        @Size(max = 1000) String reason,
        @NotNull UUID requestedByUserId,
        @NotNull @Size(min = 1) @Valid List<Line> items) {

    public record Line(
            @NotNull UUID itemId,
            @DecimalMin("0.0") BigDecimal quantity) {
    }

    public CreateDeviationRequestCommand toCommand() {
        return new CreateDeviationRequestCommand(reason, requestedByUserId,
                items.stream()
                        .map(l -> new CreateDeviationRequestCommand.Line(l.itemId(), l.quantity()))
                        .toList());
    }
}
