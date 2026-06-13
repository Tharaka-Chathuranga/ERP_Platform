package com.enlear.erp.store.controller.dto;

import com.enlear.erp.store.service.command.CreateBorrowRequestCommand;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.util.UUID;

public record CreateBorrowRequestRequest(
        @NotNull UUID issueId,
        @Size(max = 1000) String reason,
        @NotNull UUID requestedByUserId) {

    public CreateBorrowRequestCommand toCommand() {
        return new CreateBorrowRequestCommand(issueId, reason, requestedByUserId);
    }
}
