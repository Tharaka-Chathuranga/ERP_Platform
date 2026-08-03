package com.enlear.erp.oilmart.model;

import com.enlear.erp.shared.error.BusinessRuleException;
import com.enlear.erp.shared.model.BaseEntity;
import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import java.math.BigDecimal;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "oil_mart_receipts", schema = "oilmart")
@Getter
@NoArgsConstructor
public class OilMartReceipt extends BaseEntity {

    @Column(name = "receipt_no", nullable = false, unique = true, length = 32)
    private String receiptNo;

    @Column(name = "supplier_id", nullable = false)
    private UUID supplierId;

    @Column(name = "reference_no", length = 100)
    private String referenceNo;

    @Column(name = "received_at", nullable = false)
    private Instant receivedAt;

    @Column(name = "received_by_user_id", nullable = false)
    private UUID receivedByUserId;

    @Column(name = "total_cost", nullable = false, precision = 19, scale = 4)
    private BigDecimal totalCost = BigDecimal.ZERO;

    @Column(length = 1000)
    private String note;

    @OneToMany(cascade = CascadeType.ALL, orphanRemoval = true)
    @JoinColumn(name = "receipt_id", nullable = false)
    private List<OilMartReceiptLine> lines = new ArrayList<>();

    public OilMartReceipt(String receiptNo, UUID supplierId, String referenceNo, Instant receivedAt,
                          UUID receivedByUserId, String note) {
        this.receiptNo = receiptNo;
        this.supplierId = supplierId;
        this.referenceNo = referenceNo;
        this.receivedAt = receivedAt;
        this.receivedByUserId = receivedByUserId;
        this.note = note;
    }

    public void addLine(UUID itemId, BigDecimal quantityLitres, BigDecimal buyUnitPrice) {
        lines.add(new OilMartReceiptLine(itemId, quantityLitres, buyUnitPrice));
        recalculateTotal();
    }

    public void requireLines() {
        if (lines.isEmpty()) {
            throw new BusinessRuleException("OILMART_RECEIPT_EMPTY",
                    "A receipt needs at least one line");
        }
    }

    private void recalculateTotal() {
        this.totalCost = lines.stream()
                .map(OilMartReceiptLine::getLineTotal)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }
}
