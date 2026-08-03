package com.enlear.erp.oilmart.service.command;

import com.enlear.erp.oilmart.model.OilMartStockAdjustmentDirection;
import java.math.BigDecimal;
import java.util.UUID;

public record AdjustOilMartStockCommand(
        UUID itemId,
        BigDecimal quantityLitres,
        OilMartStockAdjustmentDirection direction,
        String reason) {
}
