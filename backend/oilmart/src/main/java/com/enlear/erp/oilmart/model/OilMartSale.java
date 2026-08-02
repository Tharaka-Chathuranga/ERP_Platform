package com.enlear.erp.oilmart.model;

import com.enlear.erp.shared.error.BusinessRuleException;
import com.enlear.erp.shared.model.BaseEntity;
import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
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
@Table(name = "oil_mart_sales", schema = "oilmart")
@Getter
@NoArgsConstructor
public class OilMartSale extends BaseEntity {

    @Column(name = "sale_no", nullable = false, unique = true, length = 32)
    private String saleNo;

    @Column(name = "client_id", nullable = false)
    private UUID clientId;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 16)
    private OilMartSaleStatus status = OilMartSaleStatus.QUOTATION;

    @Column(name = "created_by_user_id", nullable = false)
    private UUID createdByUserId;

    @Column(name = "quoted_at", nullable = false)
    private Instant quotedAt;

    @Column(name = "valid_until")
    private LocalDate validUntil;

    @Column(name = "quotation_approved_by_user_id")
    private UUID quotationApprovedByUserId;

    @Column(name = "quotation_approved_at")
    private Instant quotationApprovedAt;

    @Column(name = "ordered_at")
    private Instant orderedAt;

    @Column(name = "approved_by_user_id")
    private UUID approvedByUserId;

    @Column(name = "approved_at")
    private Instant approvedAt;

    @Column(name = "rejection_reason", length = 1000)
    private String rejectionReason;

    @Column(name = "dispatched_at")
    private Instant dispatchedAt;

    @Column(name = "dispatched_by_user_id")
    private UUID dispatchedByUserId;

    @Column(name = "vehicle_no", length = 50)
    private String vehicleNo;

    @Column(name = "driver_name", length = 150)
    private String driverName;

    @Column(name = "invoice_no", unique = true, length = 32)
    private String invoiceNo;

    @Column(name = "invoiced_at")
    private Instant invoicedAt;

    @Column(name = "invoiced_by_user_id")
    private UUID invoicedByUserId;

    @Enumerated(EnumType.STRING)
    @Column(name = "payment_method", length = 16)
    private OilMartPaymentMethod paymentMethod;

    @Column(name = "cancellation_reason", length = 1000)
    private String cancellationReason;

    @Column(nullable = false, precision = 19, scale = 4)
    private BigDecimal subtotal = BigDecimal.ZERO;

    @Column(name = "discount_amount", nullable = false, precision = 19, scale = 4)
    private BigDecimal discountAmount = BigDecimal.ZERO;

    @Column(nullable = false, precision = 19, scale = 4)
    private BigDecimal total = BigDecimal.ZERO;

    @Column(length = 1000)
    private String note;

    @OneToMany(cascade = CascadeType.ALL, orphanRemoval = true)
    @JoinColumn(name = "sale_id", nullable = false)
    private List<OilMartSaleLine> lines = new ArrayList<>();

    public OilMartSale(String saleNo, UUID clientId, UUID createdByUserId, Instant quotedAt,
                       LocalDate validUntil, BigDecimal discountAmount, String note) {
        this.saleNo = saleNo;
        this.clientId = clientId;
        this.createdByUserId = createdByUserId;
        this.quotedAt = quotedAt != null ? quotedAt : Instant.now();
        this.validUntil = validUntil;
        this.discountAmount = discountAmount != null ? discountAmount : BigDecimal.ZERO;
        this.note = note;
        this.status = OilMartSaleStatus.QUOTATION;
    }

    public void addLine(UUID itemId, BigDecimal quantityLitres, BigDecimal listUnitPrice,
                        BigDecimal unitPrice, BigDecimal discountPercent) {
        lines.add(new OilMartSaleLine(itemId, quantityLitres, listUnitPrice, unitPrice, discountPercent));
        recalculateTotals();
    }

    public void submitForApproval() {
        requireStatus(OilMartSaleStatus.QUOTATION, "submitted for quotation approval");
        requireNotExpired();
        this.status = OilMartSaleStatus.QUOTATION_APPROVAL;
    }

    public void approveQuotation(UUID approverId, String orderNo) {
        requireStatus(OilMartSaleStatus.QUOTATION_APPROVAL, "approved as a quotation");
        requireNotExpired();
        this.quotationApprovedByUserId = approverId;
        this.quotationApprovedAt = Instant.now();
        this.saleNo = orderNo;
        this.status = OilMartSaleStatus.ORDERED;
        this.orderedAt = Instant.now();
        this.rejectionReason = null;
    }

    public void rejectQuotation(UUID approverId, String reason) {
        requireStatus(OilMartSaleStatus.QUOTATION_APPROVAL, "rejected at quotation approval");
        requireReason(reason, "rejection");
        this.status = OilMartSaleStatus.REJECTED;
        this.quotationApprovedByUserId = approverId;
        this.quotationApprovedAt = Instant.now();
        this.rejectionReason = reason;
    }

    public void approve(UUID approverId) {
        requireStatus(OilMartSaleStatus.ORDERED, "approved");
        this.status = OilMartSaleStatus.APPROVED;
        this.approvedByUserId = approverId;
        this.approvedAt = Instant.now();
        this.rejectionReason = null;
    }

    public void reject(UUID approverId, String reason) {
        requireStatus(OilMartSaleStatus.ORDERED, "rejected");
        requireReason(reason, "rejection");
        this.status = OilMartSaleStatus.REJECTED;
        this.approvedByUserId = approverId;
        this.approvedAt = Instant.now();
        this.rejectionReason = reason;
    }

    public void dispatch(UUID dispatchedByUserId, String vehicleNo, String driverName) {
        requireStatus(OilMartSaleStatus.APPROVED, "dispatched");
        this.status = OilMartSaleStatus.DISPATCHED;
        this.dispatchedAt = Instant.now();
        this.dispatchedByUserId = dispatchedByUserId;
        this.vehicleNo = vehicleNo;
        this.driverName = driverName;
    }

    public void raiseInvoice(String invoiceNo, UUID invoicedByUserId, OilMartPaymentMethod paymentMethod) {
        requireStatus(OilMartSaleStatus.DISPATCHED, "invoiced");
        if (paymentMethod == null) {
            throw new BusinessRuleException("OILMART_SALE_PAYMENT_METHOD_REQUIRED",
                    "A payment method is required — oil mart invoices settle on issue");
        }
        this.status = OilMartSaleStatus.INVOICED;
        this.invoiceNo = invoiceNo;
        this.invoicedAt = Instant.now();
        this.invoicedByUserId = invoicedByUserId;
        this.paymentMethod = paymentMethod;
    }

    public void cancel(String reason) {
        if (status != OilMartSaleStatus.QUOTATION
                && status != OilMartSaleStatus.QUOTATION_APPROVAL
                && status != OilMartSaleStatus.ORDERED) {
            throw new BusinessRuleException("OILMART_SALE_ILLEGAL_TRANSITION",
                    "Only a QUOTATION, QUOTATION_APPROVAL or ORDERED sale can be cancelled (current: %s)"
                            .formatted(status));
        }
        this.status = OilMartSaleStatus.CANCELLED;
        this.cancellationReason = reason;
    }

    private void recalculateTotals() {
        this.subtotal = lines.stream()
                .map(OilMartSaleLine::getLineTotal)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        BigDecimal net = subtotal.subtract(discountAmount);
        if (net.signum() < 0) {
            throw new BusinessRuleException("OILMART_SALE_DISCOUNT_TOO_LARGE",
                    "The order discount (%s) exceeds the subtotal (%s)"
                            .formatted(discountAmount.toPlainString(), subtotal.toPlainString()));
        }
        this.total = net;
    }

    private void requireNotExpired() {
        if (validUntil != null && validUntil.isBefore(LocalDate.now())) {
            throw new BusinessRuleException("OILMART_SALE_QUOTATION_EXPIRED",
                    "This quotation expired on %s and must be re-quoted".formatted(validUntil));
        }
    }

    private void requireStatus(OilMartSaleStatus expected, String action) {
        if (status != expected) {
            throw new BusinessRuleException("OILMART_SALE_ILLEGAL_TRANSITION",
                    "Only a %s sale can be %s (current: %s)".formatted(expected, action, status));
        }
    }

    private void requireReason(String reason, String kind) {
        if (reason == null || reason.isBlank()) {
            throw new BusinessRuleException("OILMART_SALE_REASON_REQUIRED",
                    "A %s reason is required".formatted(kind));
        }
    }
}
