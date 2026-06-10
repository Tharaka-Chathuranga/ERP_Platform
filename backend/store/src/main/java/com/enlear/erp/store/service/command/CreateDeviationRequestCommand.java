package com.enlear.erp.store.service.command;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

public record CreateDeviationRequestCommand(
        String reason,
        UUID requestedByUserId,
        List<Line> items) {

    public record Line(UUID itemId, BigDecimal quantity) {
    }
}
