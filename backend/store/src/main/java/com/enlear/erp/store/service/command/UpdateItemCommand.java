package com.enlear.erp.store.service.command;

import java.math.BigDecimal;

/** Intent to update an existing item's editable master-data fields. */
public record UpdateItemCommand(
        String name,
        String description,
        String category,
        BigDecimal reorderLevel,
        boolean criticalItem,
        boolean approvalRequiredForIssue) {
}
