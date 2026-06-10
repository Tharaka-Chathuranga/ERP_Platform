package com.enlear.erp.store.service.command;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

/** Intent to raise an issue/borrow document with one or more lines. */
public record CreateIssueCommand(
        UUID warehouseId,
        UUID borrowingUserId,
        UUID storeKeeperId,
        List<Line> lines) {

    public record Line(UUID itemId, BigDecimal quantity, boolean returnable) {
    }
}
