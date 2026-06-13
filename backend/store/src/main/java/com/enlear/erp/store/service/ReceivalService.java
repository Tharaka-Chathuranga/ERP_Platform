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
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

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

        if (cmd.receivalItems() == null || cmd.receivalItems().isEmpty()) {
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

        Set<UUID> requestedItemIds = cmd.receivalItems().stream()
                .map(CreateReceivalCommand.ReceivalItem::itemId)
                .collect(Collectors.toSet());
        Set<UUID> existingItemIds = new HashSet<>(items.findExistingIds(requestedItemIds));

        for (CreateReceivalCommand.ReceivalItem item : cmd.receivalItems()) {
            if (!existingItemIds.contains(item.itemId())) {
                throw new ResourceNotFoundException("Item", item.itemId());
            }
            receival.addLine(new ReceivalItem(item.itemId(), item.quantity(), item.unitCost()));
        }
        receivals.save(receival);

        for (ReceivalItem line : receival.getLines()) {
            stock.postMovement(new PostStockMovementCommand(line.getItemId(), MovementType.RECEIPT,
                    line.getQuantity(), line.getUnitCost(), receival.getReceivalNumber(),
                    receival.getReceivedAt()));
        }

        if (!receival.hasPurchaseOrder()) {
            generateGrn(receival, List.of(receival));
        } else if (cmd.allReceivedForPo()) {
            generateGrn(receival, receivals.findByPoNumberAndGoodReceiveNoteIdIsNull(receival.getPoNumber()));
        }
        return receival;
    }


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
