package com.enlear.erp.store.service.command;

import java.util.UUID;

public record CreateBorrowRequestCommand(
        UUID issueId,
        String reason,
        UUID requestedByUserId) {
}
