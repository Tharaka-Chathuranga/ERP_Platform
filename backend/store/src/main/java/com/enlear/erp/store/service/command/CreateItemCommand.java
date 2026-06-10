package com.enlear.erp.store.service.command;

import com.enlear.erp.store.domain.Location;
import com.enlear.erp.store.domain.ValuationMethod;
import java.math.BigDecimal;
import java.util.List;

/** Intent to create a new item. Validated at the web edge before reaching here. */
public record CreateItemCommand(
        String sku,
        String name,
        String description,
        String unitOfMeasure,
        BigDecimal unitPrice,
        String category,
        ValuationMethod valuationMethod,
        BigDecimal reorderLevel,
        boolean criticalItem,
        boolean approvalRequiredForIssue,
        List<Location> locations) {
}
