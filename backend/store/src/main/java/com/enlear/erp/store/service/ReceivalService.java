package com.enlear.erp.store.service;

import com.enlear.erp.shared.error.BusinessRuleException;
import com.enlear.erp.shared.error.ResourceNotFoundException;
import com.enlear.erp.store.model.GoodsReceipt;
import com.enlear.erp.store.model.GoodsReceiptLine;
import com.enlear.erp.store.model.MovementType;
import com.enlear.erp.store.model.Receival;
import com.enlear.erp.store.model.ReceivalItem;
import com.enlear.erp.store.repository.GoodsReceiptRepository;
import com.enlear.erp.store.repository.ItemRepository;
import com.enlear.erp.store.repository.ReceivalRepository;
import com.enlear.erp.store.repository.SupplierRepository;
import com.enlear.erp.store.service.command.CreateReceivalCommand;
import com.enlear.erp.store.service.command.PostStockMovementCommand;
import java.time.Instant;
import java.util.List;
import java.util.UUID;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Item receiving. Recording a receival is one transaction that:
 * <ol>
 *   <li>persists the receival header + lines,</li>
 *   <li>posts a {@code RECEIPT} stock movement per line (the real inventory effect), and</li>
 *   <li>conditionally generates a GRN:
 *     <ul>
 *       <li>no PO → a GRN for this receival immediately;</li>
 *       <li>PO + "all received" → one GRN aggregating every open receival for the PO;</li>
 *       <li>PO + partial → no GRN yet.</li>
 *     </ul>
 *   </li>
 * </ol>
 * GRN generation writes no stock — the receival already did, so it cannot double-count.
 */
@Service
@Transactional
public class ReceivalService {

    private final ReceivalRepository receivals;
    private final GoodsReceiptRepository goodsReceipts;
    private final SupplierRepository suppliers;
    private final ItemRepository items;
    private final StockService stock;

    public ReceivalService(ReceivalRepository receivals, GoodsReceiptRepository goodsReceipts,
                           SupplierRepository suppliers, ItemRepository items, StockService stock) {
        this.receivals = receivals;
        this.goodsReceipts = goodsReceipts;
        this.suppliers = suppliers;
        this.items = items;
        this.stock = stock;
    }

    public Receival create(CreateReceivalCommand cmd) {
        if (cmd.lines() == null || cmd.lines().isEmpty()) {
            throw new BusinessRuleException("STORE_RECEIVAL_EMPTY",
                    "A receival must have at least one line");
        }

        boolean registered = cmd.supplierId() != null;
        boolean unregistered = cmd.supplierName() != null && !cmd.supplierName().isBlank();
        if (registered == unregistered) {
            throw new BusinessRuleException("STORE_RECEIVAL_SUPPLIER",
                    "Provide either a registered supplier or an unregistered supplier name, not both");
        }
        if (registered && !suppliers.existsById(cmd.supplierId())) {
            throw new ResourceNotFoundException("Supplier", cmd.supplierId());
        }

        Receival receival = new Receival(generateReceivalNumber(), trimToNull(cmd.poNumber()),
                trimToNull(cmd.invoiceNumber()), cmd.supplierId(),
                unregistered ? cmd.supplierName().trim() : null,
                cmd.allReceivedForPo(), cmd.storeKeeperId(),
                cmd.receivedAt() != null ? cmd.receivedAt() : Instant.now());

        for (CreateReceivalCommand.Line line : cmd.lines()) {
            if (!items.existsById(line.itemId())) {
                throw new ResourceNotFoundException("Item", line.itemId());
            }
            receival.addLine(new ReceivalItem(line.itemId(), line.quantity(), line.unitCost()));
        }
        receivals.save(receival);

        // Always: record the inventory effect on the stock ledger.
        for (ReceivalItem line : receival.getLines()) {
            stock.postMovement(new PostStockMovementCommand(line.getItemId(), MovementType.RECEIPT,
                    line.getQuantity(), line.getUnitCost(), receival.getReceivalNumber(),
                    receival.getReceivedAt()));
        }

        // Conditionally generate the GRN.
        if (!receival.hasPurchaseOrder()) {
            generateGrn(receival, List.of(receival));
        } else if (cmd.allReceivedForPo()) {
            generateGrn(receival, receivals.findByPoNumberAndGoodReceiveNoteIdIsNull(receival.getPoNumber()));
        }
        return receival;
    }

    /**
     * Generates a POSTED GRN covering every line of {@code sources}, using
     * {@code header} for the supplier/PO/invoice context, then links each source
     * receival to it. No stock is posted here.
     */
    private GoodsReceipt generateGrn(Receival header, List<Receival> sources) {
        GoodsReceipt grn = GoodsReceipt.generated(generateGrnNumber(), header.getPoNumber(),
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

    @Transactional(readOnly = true)
    public Receival get(UUID id) {
        return receivals.findWithLinesById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Receival", id));
    }

    @Transactional(readOnly = true)
    public Page<Receival> list(UUID supplierId, Pageable pageable) {
        return supplierId == null
                ? receivals.findAllByOrderByReceivedAtDesc(pageable)
                : receivals.findBySupplierIdOrderByReceivedAtDesc(supplierId, pageable);
    }

    private String generateReceivalNumber() {
        return "RCV-" + Instant.now().toEpochMilli();
    }

    private String generateGrnNumber() {
        return "GRN-" + Instant.now().toEpochMilli();
    }

    private static String trimToNull(String s) {
        return s == null || s.isBlank() ? null : s.trim();
    }
}
