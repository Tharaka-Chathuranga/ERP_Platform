package com.enlear.erp.store.service.command;

import java.math.BigDecimal;
import java.util.UUID;

public record CreateBorrowRequestCommand(
        UUID itemId,
        BigDecimal quantity,
        String reason,
        UUID requestedByUserId) {
}
