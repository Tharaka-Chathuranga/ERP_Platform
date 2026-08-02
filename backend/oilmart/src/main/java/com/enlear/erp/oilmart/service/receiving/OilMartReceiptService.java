package com.enlear.erp.oilmart.service.receiving;

import com.enlear.erp.oilmart.model.OilMartDocumentType;
import com.enlear.erp.oilmart.model.OilMartMovementReferenceType;
import com.enlear.erp.oilmart.model.OilMartMovementType;
import com.enlear.erp.oilmart.model.OilMartReceipt;
import com.enlear.erp.oilmart.model.OilMartSupplier;
import com.enlear.erp.oilmart.repository.OilMartReceiptRepository;
import com.enlear.erp.oilmart.service.OilMartCurrentUser;
import com.enlear.erp.oilmart.service.OilMartDocumentNumberService;
import com.enlear.erp.oilmart.service.command.RecordOilMartReceiptCommand;
import com.enlear.erp.oilmart.service.master.OilMartSupplierService;
import com.enlear.erp.oilmart.service.stock.OilMartStockService;
import com.enlear.erp.shared.error.BusinessRuleException;
import com.enlear.erp.shared.error.ResourceNotFoundException;
import java.time.Instant;
import java.util.List;
import java.util.UUID;
import org.hibernate.Hibernate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
public class OilMartReceiptService {

    private final OilMartReceiptRepository receipts;
    private final OilMartSupplierService suppliers;
    private final OilMartStockService stock;
    private final OilMartDocumentNumberService documentNumbers;
    private final OilMartCurrentUser currentUser;

    public OilMartReceiptService(OilMartReceiptRepository receipts,
                                 OilMartSupplierService suppliers,
                                 OilMartStockService stock,
                                 OilMartDocumentNumberService documentNumbers,
                                 OilMartCurrentUser currentUser) {
        this.receipts = receipts;
        this.suppliers = suppliers;
        this.stock = stock;
        this.documentNumbers = documentNumbers;
        this.currentUser = currentUser;
    }

    public OilMartReceipt record(RecordOilMartReceiptCommand cmd) {
        OilMartSupplier supplier = suppliers.get(cmd.supplierId());
        if (!supplier.isActive()) {
            throw new BusinessRuleException("OILMART_SUPPLIER_INACTIVE",
                    "%s is inactive and cannot be received from".formatted(supplier.getName()));
        }
        if (cmd.lines() == null || cmd.lines().isEmpty()) {
            throw new BusinessRuleException("OILMART_RECEIPT_EMPTY",
                    "A receipt needs at least one line");
        }

        UUID userId = currentUser.requireId();
        String receiptNo = documentNumbers.next(OilMartDocumentType.GRN);

        OilMartReceipt receipt = new OilMartReceipt(receiptNo, supplier.getId(), cmd.referenceNo(),
                cmd.receivedAt() != null ? cmd.receivedAt() : Instant.now(), userId, cmd.note());

        for (RecordOilMartReceiptCommand.Line line : cmd.lines()) {
            requirePositive(line);
            receipt.addLine(line.itemId(), line.quantityLitres(), line.buyUnitPrice());
        }
        receipt.requireLines();

        OilMartReceipt saved = receipts.save(receipt);

        saved.getLines().forEach(line -> stock.apply(
                line.getItemId(),
                line.getQuantityLitres(),
                OilMartMovementType.RECEIPT,
                OilMartMovementReferenceType.RECEIPT,
                saved.getId(),
                saved.getReceiptNo(),
                userId,
                null));

        return saved;
    }

    @Transactional(readOnly = true)
    public OilMartReceipt get(UUID id) {
        OilMartReceipt receipt = receipts.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("OilMartReceipt", id));
        Hibernate.initialize(receipt.getLines());
        return receipt;
    }

    @Transactional(readOnly = true)
    public List<OilMartReceipt> list(UUID supplierId) {
        List<OilMartReceipt> found = supplierId == null
                ? receipts.findAllByOrderByReceivedAtDesc()
                : receipts.findBySupplierIdOrderByReceivedAtDesc(supplierId);
        found.forEach(receipt -> Hibernate.initialize(receipt.getLines()));
        return found;
    }

    private void requirePositive(RecordOilMartReceiptCommand.Line line) {
        if (line.quantityLitres() == null || line.quantityLitres().signum() <= 0) {
            throw new BusinessRuleException("OILMART_RECEIPT_INVALID_QUANTITY",
                    "Each receipt line needs a quantity greater than zero");
        }
        if (line.buyUnitPrice() == null || line.buyUnitPrice().signum() < 0) {
            throw new BusinessRuleException("OILMART_RECEIPT_INVALID_PRICE",
                    "Each receipt line needs a buy price of zero or more");
        }
    }
}
