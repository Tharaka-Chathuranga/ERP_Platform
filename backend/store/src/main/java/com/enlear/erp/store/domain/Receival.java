package com.enlear.erp.store.domain;

import com.enlear.erp.shared.domain.BaseEntity;
import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
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
 * A receival: the physical "goods arrived at the store" event (header + lines).
 * Always recorded, and posting it writes a RECEIPT stock movement per line. The
 * supplier is either registered ({@link #supplierId}) or unregistered
 * ({@link #supplierName}) — never both. A {@code good_receive_note_id} is set
 * once the receival has been rolled into a generated GRN.
 */
@Entity
@Table(name = "item_receival", schema = "store")
@Getter
@NoArgsConstructor
public class Receival extends BaseEntity {

    @Column(name = "receival_number", nullable = false, unique = true, length = 32)
    private String receivalNumber;

    @Column(name = "po_number", length = 64)
    private String poNumber;

    @Column(name = "invoice_number", length = 64)
    private String invoiceNumber;

    @Column(name = "supplier_id")
    private UUID supplierId;

    @Column(name = "supplier_name", length = 200)
    private String supplierName;

    @Column(name = "all_received_for_po", nullable = false)
    private boolean allReceivedForPo;

    @Column(name = "store_keeper_id", nullable = false)
    private UUID storeKeeperId;

    @Column(name = "good_receive_note_id")
    private UUID goodReceiveNoteId;

    @Column(name = "received_at", nullable = false)
    private Instant receivedAt;

    @OneToMany(cascade = CascadeType.ALL, orphanRemoval = true)
    @JoinColumn(name = "item_receival_id", nullable = false)
    private List<ReceivalItem> lines = new ArrayList<>();

    public Receival(String receivalNumber, String poNumber, String invoiceNumber, UUID supplierId,
                    String supplierName, boolean allReceivedForPo, UUID storeKeeperId,
                    Instant receivedAt) {
        this.receivalNumber = receivalNumber;
        this.poNumber = poNumber;
        this.invoiceNumber = invoiceNumber;
        this.supplierId = supplierId;
        this.supplierName = supplierName;
        this.allReceivedForPo = allReceivedForPo;
        this.storeKeeperId = storeKeeperId;
        this.receivedAt = receivedAt != null ? receivedAt : Instant.now();
    }

    public void addLine(ReceivalItem line) {
        lines.add(line);
    }

    /** Links this receival to the GRN it was rolled into. */
    public void attachGrn(UUID grnId) {
        this.goodReceiveNoteId = grnId;
    }

    public boolean hasPurchaseOrder() {
        return poNumber != null && !poNumber.isBlank();
    }
}
