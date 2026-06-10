package com.enlear.erp.store.service.command;

import java.math.BigDecimal;
import java.util.UUID;

public record CreateDeviationRequestCommand(
        UUID itemId,
        BigDecimal quantity,
        String reason,
        UUID requestedByUserId) {
}
