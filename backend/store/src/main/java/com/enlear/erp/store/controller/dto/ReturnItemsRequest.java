package com.enlear.erp.store.controller.dto;

import com.enlear.erp.store.service.command.ReturnItemsCommand;
import jakarta.validation.Valid;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

public record ReturnItemsRequest(
        @NotEmpty @Valid List<Line> lines) {

    public record Line(
            @NotNull UUID itemId,
            @NotNull @DecimalMin(value = "0.0", inclusive = false) BigDecimal quantity) {
    }

    public ReturnItemsCommand toCommand(UUID issueId) {
        return new ReturnItemsCommand(issueId,
                lines.stream()
                        .map(l -> new ReturnItemsCommand.Line(l.itemId(), l.quantity()))
                        .toList());
    }
}
