package com.enlear.erp.store.domain;

import com.enlear.erp.shared.domain.BaseEntity;
import com.enlear.erp.shared.error.BusinessRuleException;
import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import lombok.Getter;
import lombok.NoArgsConstructor;

/**
 * A Goods Receipt Note (GRN): the header for a batch of items received from a
 * supplier. Created as {@code DRAFT}; posting it records the stock and flips it
 * to {@code POSTED} (an immutable record thereafter).
 */
@Entity
@Table(name = "good_receive_note", schema = "store")
@Getter
@NoArgsConstructor
public class GoodsReceipt extends BaseEntity {

    @Column(name = "grn_number", nullable = false, unique = true, length = 32)
    private String grnNumber;

    @Column(name = "po_number", length = 64)
    private String poNumber;

    @Column(name = "invoice_number", length = 64)
    private String invoiceNumber;

    @Column(name = "supplier_id", nullable = false)
    private UUID supplierId;

    @Column(name = "store_keeper_id", nullable = false)
    private UUID storeKeeperId;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 16)
    private GrnStatus status = GrnStatus.DRAFT;

    @Column(name = "received_at", nullable = false)
    private Instant receivedAt;

    @OneToMany(cascade = CascadeType.ALL, orphanRemoval = true)
    @JoinColumn(name = "good_receive_note_id", nullable = false)
    private List<GoodsReceiptLine> lines = new ArrayList<>();

    public GoodsReceipt(String grnNumber, String poNumber, String invoiceNumber, UUID supplierId,
                        UUID storeKeeperId, Instant receivedAt) {
        this.grnNumber = grnNumber;
        this.poNumber = poNumber;
        this.invoiceNumber = invoiceNumber;
        this.supplierId = supplierId;
        this.storeKeeperId = storeKeeperId;
        this.receivedAt = receivedAt != null ? receivedAt : Instant.now();
        this.status = GrnStatus.DRAFT;
    }

    public void addLine(GoodsReceiptLine line) {
        lines.add(line);
    }

    /** Marks the GRN as posted. Guards against double-posting. */
    public void markPosted() {
        if (status != GrnStatus.DRAFT) {
            throw new BusinessRuleException("STORE_GRN_NOT_DRAFT",
                    "Only a DRAFT goods receipt can be posted (current: " + status + ")");
        }
        if (lines.isEmpty()) {
            throw new BusinessRuleException("STORE_GRN_EMPTY",
                    "Cannot post a goods receipt with no lines");
        }
        this.status = GrnStatus.POSTED;
    }
}
