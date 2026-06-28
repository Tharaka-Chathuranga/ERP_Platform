package com.enlear.erp.store.service.command;

import com.enlear.erp.store.model.DeviationStage;
import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

public record CreateDeviationRequestCommand(
        String reason,
        UUID requestedByUserId,
        DeviationStage stage,
        List<Line> items) {

    public record Line(UUID itemId, BigDecimal quantity) {
    }
}
