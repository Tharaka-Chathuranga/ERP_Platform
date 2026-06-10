package com.enlear.erp.store.api.dto;

import java.math.BigDecimal;
import java.util.UUID;

/** Read-only view of on-hand stock, safe to share across module boundaries. */
public record StockLevelView(UUID itemId, UUID warehouseId, BigDecimal quantityOnHand) {
}
