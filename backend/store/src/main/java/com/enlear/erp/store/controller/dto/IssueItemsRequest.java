package com.enlear.erp.store.controller.dto;

import com.enlear.erp.store.service.command.IssueItemsCommand;
import jakarta.validation.Valid;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.math.BigDecimal;
import java.util.UUID;
import java.util.List;

/** The storage slots (with counts) each approved line is drawn from when issued. */
public record IssueItemsRequest(
        @NotEmpty @Valid List<LineLocation> allocations) {

    public record LineLocation(
            @NotNull UUID lineId,
            @Size(max = 64) String rack,
            @Size(max = 64) String row,
            @Size(max = 64) String column,
            @NotNull @DecimalMin(value = "0.0", inclusive = false) BigDecimal quantity) {
    }

    public IssueItemsCommand toCommand(UUID issueId) {
        return new IssueItemsCommand(issueId,
                allocations.stream()
                        .map(l -> new IssueItemsCommand.LineLocation(
                                l.lineId(), l.rack(), l.row(), l.column(), l.quantity()))
                        .toList());
    }
}
