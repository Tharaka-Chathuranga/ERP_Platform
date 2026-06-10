package com.enlear.erp.store.service;

import com.enlear.erp.shared.error.BusinessRuleException;
import com.enlear.erp.shared.error.ResourceNotFoundException;
import com.enlear.erp.store.domain.GoodsReceipt;
import com.enlear.erp.store.domain.GoodsReceiptLine;
import com.enlear.erp.store.domain.MovementType;
import com.enlear.erp.store.repository.GoodsReceiptRepository;
import com.enlear.erp.store.repository.ItemRepository;
import com.enlear.erp.store.repository.WarehouseRepository;
import com.enlear.erp.store.service.command.CreateGoodsReceiptCommand;
import com.enlear.erp.store.service.command.PostStockMovementCommand;
import java.time.Instant;
import java.util.UUID;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Goods receiving. A GRN is created as a DRAFT; posting it records every line as
 * a RECEIPT movement on the stock ledger (via {@link StockService}) inside one
 * transaction, then marks the GRN POSTED so it can't be posted twice.
 */
@Service
@Transactional
public class GoodsReceiptService {

    private final GoodsReceiptRepository receipts;
    private final WarehouseRepository warehouses;
    private final ItemRepository items;
    private final StockService stock;

    public GoodsReceiptService(GoodsReceiptRepository receipts, WarehouseRepository warehouses,
                               ItemRepository items, StockService stock) {
        this.receipts = receipts;
        this.warehouses = warehouses;
        this.items = items;
        this.stock = stock;
    }

    public GoodsReceipt createReceipt(CreateGoodsReceiptCommand cmd) {
        if (cmd.lines() == null || cmd.lines().isEmpty()) {
            throw new BusinessRuleException("STORE_GRN_EMPTY",
                    "A goods receipt must have at least one line");
        }
        if (!warehouses.existsById(cmd.warehouseId())) {
            throw new ResourceNotFoundException("Warehouse", cmd.warehouseId());
        }

        GoodsReceipt grn = new GoodsReceipt(generateGrnNumber(), cmd.poNumber(), cmd.invoiceNumber(),
                cmd.supplierId(), cmd.warehouseId(), cmd.storeKeeperId(), cmd.receivedAt());

        for (CreateGoodsReceiptCommand.Line line : cmd.lines()) {
            if (!items.existsById(line.itemId())) {
                throw new ResourceNotFoundException("Item", line.itemId());
            }
            grn.addLine(new GoodsReceiptLine(line.itemId(), line.quantity(), line.unitCost()));
        }
        return receipts.save(grn);
    }

    /** Posts a DRAFT GRN: writes RECEIPT movements and flips status to POSTED. */
    public GoodsReceipt postReceipt(UUID id) {
        GoodsReceipt grn = getReceipt(id);
        grn.markPosted();
        for (GoodsReceiptLine line : grn.getLines()) {
            stock.postMovement(new PostStockMovementCommand(
                    line.getItemId(), grn.getWarehouseId(), MovementType.RECEIPT,
                    line.getQuantity(), line.getUnitCost(), grn.getGrnNumber(),
                    "Goods receipt " + grn.getGrnNumber(), grn.getReceivedAt()));
        }
        return receipts.save(grn);
    }

    @Transactional(readOnly = true)
    public GoodsReceipt getReceipt(UUID id) {
        return receipts.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("GoodsReceipt", id));
    }

    @Transactional(readOnly = true)
    public Page<GoodsReceipt> listForSupplier(UUID supplierId, Pageable pageable) {
        return receipts.findBySupplierIdOrderByReceivedAtDesc(supplierId, pageable);
    }

    private String generateGrnNumber() {
        return "GRN-" + Instant.now().toEpochMilli();
    }
}
