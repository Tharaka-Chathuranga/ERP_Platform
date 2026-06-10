package com.enlear.erp.store.web.dto;

import com.enlear.erp.store.service.command.CreateIssueCommand;
import jakarta.validation.Valid;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

public record CreateIssueRequest(
        @NotNull UUID borrowingUserId,
        @NotNull UUID storeKeeperId,
        @NotEmpty @Valid List<Line> lines) {

    public record Line(
            @NotNull UUID itemId,
            @NotNull @DecimalMin(value = "0.0", inclusive = false) BigDecimal quantity,
            boolean returnable) {
    }

    public CreateIssueCommand toCommand() {
        return new CreateIssueCommand(borrowingUserId, storeKeeperId,
                lines.stream()
                        .map(l -> new CreateIssueCommand.Line(l.itemId(), l.quantity(), l.returnable()))
                        .toList());
    }
}
