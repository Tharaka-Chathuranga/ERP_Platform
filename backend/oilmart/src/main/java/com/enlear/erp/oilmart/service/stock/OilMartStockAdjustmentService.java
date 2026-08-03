package com.enlear.erp.oilmart.service.stock;

import com.enlear.erp.oilmart.model.OilMartItem;
import com.enlear.erp.oilmart.model.OilMartMovementReferenceType;
import com.enlear.erp.oilmart.model.OilMartMovementType;
import com.enlear.erp.oilmart.model.OilMartStockMovement;
import com.enlear.erp.oilmart.service.OilMartCurrentUser;
import com.enlear.erp.oilmart.service.command.AdjustOilMartStockCommand;
import com.enlear.erp.oilmart.service.master.OilMartItemService;
import com.enlear.erp.shared.error.BusinessRuleException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
public class OilMartStockAdjustmentService {

    private final OilMartStockService stock;
    private final OilMartItemService items;
    private final OilMartCurrentUser currentUser;

    public OilMartStockAdjustmentService(OilMartStockService stock,
                                         OilMartItemService items,
                                         OilMartCurrentUser currentUser) {
        this.stock = stock;
        this.items = items;
        this.currentUser = currentUser;
    }

    public OilMartStockMovement adjust(AdjustOilMartStockCommand cmd) {
        OilMartItem item = items.get(cmd.itemId());
        if (!item.isActive()) {
            throw new BusinessRuleException("OILMART_ITEM_INACTIVE",
                    "%s is inactive and cannot be restocked".formatted(item.getName()));
        }
        if (cmd.quantityLitres() == null || cmd.quantityLitres().signum() <= 0) {
            throw new BusinessRuleException("OILMART_ADJUSTMENT_INVALID_QUANTITY",
                    "A stock adjustment needs a quantity greater than zero");
        }
        if (cmd.reason() == null || cmd.reason().isBlank()) {
            throw new BusinessRuleException("OILMART_ADJUSTMENT_REASON_REQUIRED",
                    "A stock adjustment needs a reason");
        }

        return stock.apply(
                item.getId(),
                cmd.direction().signedDelta(cmd.quantityLitres()),
                OilMartMovementType.ADJUSTMENT,
                OilMartMovementReferenceType.MANUAL,
                null,
                null,
                currentUser.requireId(),
                cmd.reason().trim());
    }
}
