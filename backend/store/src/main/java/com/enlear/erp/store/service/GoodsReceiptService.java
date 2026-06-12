package com.enlear.erp.store.service;

import com.enlear.erp.shared.error.ResourceNotFoundException;
import com.enlear.erp.store.domain.GoodsReceipt;
import com.enlear.erp.store.repository.GoodsReceiptRepository;
import java.util.UUID;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Read access to Goods Receipt Notes (GRNs). GRNs are generated as a side effect
 * of recording receivals — see {@link ReceivalService} — so this service exposes
 * only queries.
 */
@Service
@Transactional(readOnly = true)
public class GoodsReceiptService {

    private final GoodsReceiptRepository receipts;

    public GoodsReceiptService(GoodsReceiptRepository receipts) {
        this.receipts = receipts;
    }

    public GoodsReceipt getReceipt(UUID id) {
        return receipts.findWithLinesById(id)
                .orElseThrow(() -> new ResourceNotFoundException("GoodsReceipt", id));
    }

    public Page<GoodsReceipt> listForSupplier(UUID supplierId, Pageable pageable) {
        return receipts.findBySupplierIdOrderByReceivedAtDesc(supplierId, pageable);
    }

    /** All goods receipts, most recently received first. */
    public Page<GoodsReceipt> listAll(Pageable pageable) {
        return receipts.findAllByOrderByReceivedAtDesc(pageable);
    }
}
