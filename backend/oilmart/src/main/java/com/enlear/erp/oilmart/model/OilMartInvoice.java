package com.enlear.erp.oilmart.model;

import com.enlear.erp.shared.error.BusinessRuleException;
import com.enlear.erp.shared.model.AuditedEntity;
import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Embedded;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "oil_mart_invoices", schema = "oilmart")
@Getter
@NoArgsConstructor
public class OilMartInvoice extends AuditedEntity {

    @Column(name = "invoice_no", nullable = false, unique = true, length = 32)
    private String invoiceNo;

    @Column(name = "quotation_id", nullable = false)
    private UUID quotationId;

    @Column(name = "quotation_no", nullable = false, length = 32)
    private String quotationNo;

    @Column(name = "client_id", nullable = false)
    private UUID clientId;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 24)
    private OilMartInvoiceStatus status = OilMartInvoiceStatus.PENDING_APPROVAL;

    @Column(name = "created_by_user_id", nullable = false)
    private UUID createdByUserId;

    @Column(name = "invoice_date", nullable = false)
    private LocalDate invoiceDate;

    @Column(name = "approved_by_user_id")
    private UUID approvedByUserId;

    @Column(name = "approved_at")
    private Instant approvedAt;

    @Column(name = "rejected_by_user_id")
    private UUID rejectedByUserId;

    @Column(name = "rejected_at")
    private Instant rejectedAt;

    @Column(name = "rejection_reason", length = 1000)
    private String rejectionReason;

    @Embedded
    private OilMartBankDetails bankDetails;

    @Column(nullable = false, precision = 19, scale = 4)
    private BigDecimal subtotal = BigDecimal.ZERO;

    @Column(name = "gst_rate_percent", nullable = false, precision = 5, scale = 2)
    private BigDecimal gstRatePercent = BigDecimal.ZERO;

    @Column(name = "gst_amount", nullable = false, precision = 19, scale = 4)
    private BigDecimal gstAmount = BigDecimal.ZERO;

    @Column(name = "grand_total", nullable = false, precision = 19, scale = 4)
    private BigDecimal grandTotal = BigDecimal.ZERO;

    @Column(name = "total_cost", nullable = false, precision = 19, scale = 4)
    private BigDecimal totalCost = BigDecimal.ZERO;

    @Column(name = "total_profit", nullable = false, precision = 19, scale = 4)
    private BigDecimal totalProfit = BigDecimal.ZERO;

    @Column(length = 1000)
    private String note;

    @OneToMany(cascade = CascadeType.ALL, orphanRemoval = true)
    @JoinColumn(name = "invoice_id", nullable = false)
    private List<OilMartInvoiceLine> lines = new ArrayList<>();

    public OilMartInvoice(String invoiceNo, UUID createdByUserId, LocalDate invoiceDate,
                          OilMartBankDetails bankDetails, String note,
                          OilMartQuotation quotation) {
        this.invoiceNo = invoiceNo;
        this.createdByUserId = createdByUserId;
        this.invoiceDate = invoiceDate;
        this.bankDetails = bankDetails;
        this.note = note;
        this.status = OilMartInvoiceStatus.PENDING_APPROVAL;
        copyFrom(quotation);
    }

    public void reselectQuotation(OilMartQuotation quotation) {
        requireStatus(OilMartInvoiceStatus.REJECTED, "pointed at a different quotation");
        copyFrom(quotation);
        this.status = OilMartInvoiceStatus.PENDING_APPROVAL;
        this.rejectedByUserId = null;
        this.rejectedAt = null;
        this.rejectionReason = null;
    }

    public void approve(UUID approverId) {
        requireStatus(OilMartInvoiceStatus.PENDING_APPROVAL, "approved");
        this.status = OilMartInvoiceStatus.APPROVED;
        this.approvedByUserId = approverId;
        this.approvedAt = Instant.now();
    }

    public void reject(UUID approverId, String reason) {
        requireStatus(OilMartInvoiceStatus.PENDING_APPROVAL, "rejected");
        if (reason == null || reason.isBlank()) {
            throw new BusinessRuleException("OILMART_INVOICE_REASON_REQUIRED",
                    "A rejection reason is required");
        }
        this.status = OilMartInvoiceStatus.REJECTED;
        this.rejectedByUserId = approverId;
        this.rejectedAt = Instant.now();
        this.rejectionReason = reason;
    }

    private void copyFrom(OilMartQuotation quotation) {
        this.quotationId = quotation.getId();
        this.quotationNo = quotation.getQuotationNo();
        this.clientId = quotation.getClientId();
        this.subtotal = quotation.getSubtotal();
        this.gstRatePercent = quotation.getGstRatePercent();
        this.gstAmount = quotation.getGstAmount();
        this.grandTotal = quotation.getGrandTotal();
        this.totalCost = quotation.getTotalCost();
        this.totalProfit = quotation.getTotalProfit();
        this.lines.clear();
        quotation.getLines().forEach(line -> this.lines.add(new OilMartInvoiceLine(line)));
    }

    public void requireUnchangedSince(Instant expectedUpdatedAt) {
        if (expectedUpdatedAt == null || !expectedUpdatedAt.equals(getUpdatedAt())) {
            throw new BusinessRuleException("OILMART_INVOICE_MODIFIED",
                    "%s was changed by someone else since you loaded it — reload and try again"
                            .formatted(invoiceNo));
        }
    }

    private void requireStatus(OilMartInvoiceStatus expected, String action) {
        if (status != expected) {
            throw new BusinessRuleException("OILMART_INVOICE_ILLEGAL_TRANSITION",
                    "Only a %s invoice can be %s (current: %s)".formatted(expected, action, status));
        }
    }
}
