package com.enlear.erp.store.service.agent;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

/**
 * The full picture of a single reorder situation, assembled deterministically by
 * {@link ReorderEvaluationService} and handed to a {@link StockManagementAgent}.
 * This is the agent's INPUT — every fact here is computed from the database, so a
 * future LLM agent never has to (and must not) invent stock or supplier data.
 *
 * @param suppliers candidate suppliers for the item, already sorted by the
 *                  soonest lead time (then cheapest last price)
 */
public record ReorderAssessment(
        UUID itemId,
        String itemCode,
        String itemName,
        BigDecimal onHand,
        BigDecimal reorderLevel,
        BigDecimal shortfall,
        boolean criticalItem,
        List<SupplierOption> suppliers) {

    /** One sourcing option for the item. */
    public record SupplierOption(
            UUID supplierId,
            String supplierCode,
            String supplierName,
            Integer leadTimeDays,
            BigDecimal lastPurchasePrice) {
    }

    public boolean hasSuppliers() {
        return suppliers != null && !suppliers.isEmpty();
    }
}
