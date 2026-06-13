package com.enlear.erp.store.controller.dto;

import com.enlear.erp.store.service.command.DecideIssueLinesCommand;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import java.util.UUID;
import java.util.List;

/** Approve/reject a set of issue lines in one request. */
public record DecideIssueLinesRequest(
        @NotEmpty @Valid List<Decision> decisions) {

    public record Decision(
            @NotNull UUID lineId,
            boolean approve) {
    }

    public DecideIssueLinesCommand toCommand(UUID issueId, UUID approverId) {
        return new DecideIssueLinesCommand(issueId, approverId,
                decisions.stream()
                        .map(d -> new DecideIssueLinesCommand.Decision(d.lineId(), d.approve()))
                        .toList());
    }
}
