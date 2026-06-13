package com.enlear.erp.store.service.receival;

import static com.enlear.erp.store.service.receival.TextUtils.hasText;
import static com.enlear.erp.store.service.receival.TextUtils.trimToNull;

import com.enlear.erp.store.model.Receival;
import com.enlear.erp.store.model.ReceivalItem;
import com.enlear.erp.store.service.command.CreateReceivalCommand;
import java.time.Instant;
import org.springframework.stereotype.Component;


@Component
class ReceivalCreator {

    private final ReferenceNumberGenerator numbers;

    ReceivalCreator(ReferenceNumberGenerator numbers) {
        this.numbers = numbers;
    }

    Receival build(CreateReceivalCommand cmd) {
        Receival receival = new Receival(numbers.receivalNumber(), trimToNull(cmd.poNumber()),
                trimToNull(cmd.invoiceNumber()), cmd.supplierId(),
                hasText(cmd.supplierName()) ? cmd.supplierName().trim() : null,
                cmd.allReceivedForPo(), cmd.storeKeeperId(),
                cmd.receivedAt() != null ? cmd.receivedAt() : Instant.now());
        for (CreateReceivalCommand.ReceivalItem item : cmd.receivalItems()) {
            receival.addLine(new ReceivalItem(item.itemId(), item.quantity(), item.unitCost()));
        }
        return receival;
    }
}
