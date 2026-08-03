package com.enlear.erp.oilmart.service.command;

import com.enlear.erp.oilmart.model.OilMartItemStatus;
import com.enlear.erp.oilmart.model.OilType;
import java.math.BigDecimal;

public record SaveOilMartItemCommand(
        String code,
        String name,
        OilType oilType,
        String brand,
        String grade,
        String description,
        String unitOfMeasure,
        BigDecimal reorderLevelLitres,
        OilMartItemStatus status) {
}
