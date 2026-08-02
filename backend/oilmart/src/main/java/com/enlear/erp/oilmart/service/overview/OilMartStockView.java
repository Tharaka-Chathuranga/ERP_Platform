package com.enlear.erp.oilmart.service.overview;

import com.enlear.erp.oilmart.model.OilType;
import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

public record OilMartStockView(
        UUID itemId,
        String itemCode,
        String itemName,
        OilType oilType,
        BigDecimal quantityOnHand,
        BigDecimal reorderLevelLitres,
        BigDecimal buyPrice,
        BigDecimal sellPrice,
        BigDecimal stockValue,
        Instant lastMovementAt) {

    public boolean isLow() {
        return quantityOnHand.compareTo(reorderLevelLitres) < 0;
    }
}
