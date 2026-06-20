package com.enlear.erp.store.service.command;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

/** Intent to approve/reject one or more lines of an issue in a single action. */
public record DecideIssueLinesCommand(
        UUID issueId,
        UUID approverId,
        List<Decision> decisions) {

    public record Decision(UUID lineId, boolean approve, BigDecimal approvedQuantity) {
    }
}
