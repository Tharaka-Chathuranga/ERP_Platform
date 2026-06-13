package com.enlear.erp.store.service.receival;

import com.enlear.erp.store.model.GoodsReceipt;
import com.enlear.erp.store.model.GoodsReceiptLine;
import com.enlear.erp.store.model.Receival;
import com.enlear.erp.store.model.ReceivalItem;
import com.enlear.erp.store.repository.GoodsReceiptRepository;
import com.enlear.erp.store.repository.ReceivalRepository;
import java.util.List;
import org.springframework.stereotype.Component;

@Component
class GrnCreator {

    private final ReceivalRepository receivals;
    private final GoodsReceiptRepository goodsReceipts;
    private final ReferenceNumberGenerator numbers;

    GrnCreator(ReceivalRepository receivals, GoodsReceiptRepository goodsReceipts,
                 ReferenceNumberGenerator numbers) {
        this.receivals = receivals;
        this.goodsReceipts = goodsReceipts;
        this.numbers = numbers;
    }

    void generateIfApplicable(Receival receival, boolean allReceivedForPo) {
        if (!receival.hasPurchaseOrder()) {
            generate(receival, List.of(receival));
        } else if (allReceivedForPo) {
            generate(receival, receivals.findByPoNumberAndGoodReceiveNoteIdIsNull(receival.getPoNumber()));
        }
    }

    private GoodsReceipt generate(Receival header, List<Receival> sources) {
        GoodsReceipt grn = GoodsReceipt.generated(numbers.grnNumber(), header.getPoNumber(),
                header.getInvoiceNumber(), header.getSupplierId(), header.getSupplierName(),
                header.getStoreKeeperId(), header.getReceivedAt());
        for (Receival source : sources) {
            for (ReceivalItem line : source.getLines()) {
                grn.addLine(new GoodsReceiptLine(line.getItemId(), line.getQuantity(), line.getUnitCost()));
            }
        }
        GoodsReceipt saved = goodsReceipts.save(grn);
        for (Receival source : sources) {
            source.attachGrn(saved.getId());
            receivals.save(source);
        }
        return saved;
    }
}
