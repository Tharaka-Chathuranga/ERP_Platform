package com.enlear.erp.store.service.receival;

import com.enlear.erp.store.model.MovementType;
import com.enlear.erp.store.model.Receival;
import com.enlear.erp.store.model.ReceivalItem;
import com.enlear.erp.store.service.StockService;
import com.enlear.erp.store.service.command.PostStockMovementCommand;
import org.springframework.stereotype.Component;

@Component
class ReceiptMovementCreator {

    private final StockService stock;

    ReceiptMovementCreator(StockService stock) {
        this.stock = stock;
    }

    void postFor(Receival receival) {
        for (ReceivalItem line : receival.getLines()) {
            stock.postMovement(new PostStockMovementCommand(line.getItemId(), MovementType.RECEIPT,
                    line.getQuantity(), line.getUnitCost(), receival.getReceivalNumber(),
                    receival.getReceivedAt(), line.toLocation()));
        }
    }
}
