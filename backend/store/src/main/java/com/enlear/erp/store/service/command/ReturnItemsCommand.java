package com.enlear.erp.store.service.command;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

/** Intent to return previously-issued returnable items against an issue. */
public record ReturnItemsCommand(
        UUID issueId,
        List<Line> lines) {

    public record Line(UUID itemId, BigDecimal quantity) {
    }
}
