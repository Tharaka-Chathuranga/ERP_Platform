package com.enlear.erp.store.model;

import com.enlear.erp.shared.model.BaseEntity;
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
 * A Goods Receipt Note (GRN): the formal record of items received against a
 * supplier. GRNs are generated from {@link Receival}s (which already posted the
 * stock), so a GRN is created directly as {@code POSTED} and writes no stock of
 * its own. The supplier is either registered ({@link #supplierId}) or
 * unregistered ({@link #supplierName}).
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

    @Column(name = "supplier_id")
    private UUID supplierId;

    @Column(name = "supplier_name", length = 200)
    private String supplierName;

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

    private GoodsReceipt(String grnNumber, String poNumber, String invoiceNumber, UUID supplierId,
                         String supplierName, UUID storeKeeperId, Instant receivedAt) {
        this.grnNumber = grnNumber;
        this.poNumber = poNumber;
        this.invoiceNumber = invoiceNumber;
        this.supplierId = supplierId;
        this.supplierName = supplierName;
        this.storeKeeperId = storeKeeperId;
        this.receivedAt = receivedAt != null ? receivedAt : Instant.now();
    }

    /**
     * Creates a finalized GRN ({@code POSTED}). Stock is posted by the originating
     * receival(s), so the GRN itself records no movements — add its lines with
     * {@link #addLine(GoodsReceiptLine)} before saving.
     */
    public static GoodsReceipt generated(String grnNumber, String poNumber, String invoiceNumber,
                                         UUID supplierId, String supplierName, UUID storeKeeperId,
                                         Instant receivedAt) {
        GoodsReceipt grn = new GoodsReceipt(grnNumber, poNumber, invoiceNumber, supplierId,
                supplierName, storeKeeperId, receivedAt);
        grn.status = GrnStatus.POSTED;
        return grn;
    }

    public void addLine(GoodsReceiptLine line) {
        lines.add(line);
    }
}
