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
import java.math.RoundingMode;
import java.time.Instant;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "oil_mart_quotations", schema = "oilmart")
@Getter
@NoArgsConstructor
public class OilMartQuotation extends BaseEntity {

    private static final BigDecimal HUNDRED = BigDecimal.valueOf(100);
    private static final int MONEY_SCALE = 4;

    @Column(name = "quotation_no", nullable = false, unique = true, length = 32)
    private String quotationNo;

    @Column(name = "client_id", nullable = false)
    private UUID clientId;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 24)
    private OilMartQuotationStatus status = OilMartQuotationStatus.DRAFT;

    @Column(name = "created_by_user_id", nullable = false)
    private UUID createdByUserId;

    @Column(name = "issued_date", nullable = false)
    private LocalDate issuedDate;

    @Column(name = "valid_until", nullable = false)
    private LocalDate validUntil;

    @Column(name = "submitted_at")
    private Instant submittedAt;

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

    @Column(name = "cancellation_reason", length = 1000)
    private String cancellationReason;

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
    @JoinColumn(name = "quotation_id", nullable = false)
    private List<OilMartQuotationLine> lines = new ArrayList<>();

    public OilMartQuotation(String quotationNo, UUID clientId, UUID createdByUserId,
                            LocalDate issuedDate, LocalDate validUntil,
                            BigDecimal gstRatePercent, String note) {
        this.quotationNo = quotationNo;
        this.clientId = clientId;
        this.createdByUserId = createdByUserId;
        this.issuedDate = issuedDate;
        this.validUntil = validUntil;
        this.gstRatePercent = gstRatePercent != null ? gstRatePercent : BigDecimal.ZERO;
        this.note = note;
        this.status = OilMartQuotationStatus.DRAFT;
        requireValidityWindow();
    }

    public void addLine(UUID itemId, BigDecimal quantityLitres, BigDecimal listUnitPrice,
                        BigDecimal unitPrice, BigDecimal discountPercent, BigDecimal unitCost) {
        lines.add(new OilMartQuotationLine(itemId, quantityLitres, listUnitPrice, unitPrice,
                discountPercent, unitCost));
        recalculateTotals();
    }

    public void beginRevision(LocalDate issuedDate, LocalDate validUntil, String note) {
        requireEditable();
        this.issuedDate = issuedDate;
        this.validUntil = validUntil;
        this.note = note;
        this.lines.clear();
        requireValidityWindow();
        recalculateTotals();
    }

    public void submitForApproval() {
        if (status != OilMartQuotationStatus.DRAFT && status != OilMartQuotationStatus.REJECTED) {
            throw new BusinessRuleException("OILMART_QUOTATION_ILLEGAL_TRANSITION",
                    "Only a DRAFT or REJECTED quotation can be submitted for approval (current: %s)"
                            .formatted(status));
        }
        requireLines();
        requireNotExpired();
        resubmit();
    }

    public void approve(UUID approverId) {
        requireStatus(OilMartQuotationStatus.PENDING_APPROVAL, "approved");
        requireNotExpired();
        this.status = OilMartQuotationStatus.APPROVED;
        this.approvedByUserId = approverId;
        this.approvedAt = Instant.now();
        this.rejectedByUserId = null;
        this.rejectedAt = null;
        this.rejectionReason = null;
    }

    public void reject(UUID approverId, String reason) {
        requireStatus(OilMartQuotationStatus.PENDING_APPROVAL, "rejected");
        if (reason == null || reason.isBlank()) {
            throw new BusinessRuleException("OILMART_QUOTATION_REASON_REQUIRED",
                    "A rejection reason is required");
        }
        this.status = OilMartQuotationStatus.REJECTED;
        this.rejectedByUserId = approverId;
        this.rejectedAt = Instant.now();
        this.rejectionReason = reason;
    }

    public void cancel(String reason) {
        if (status == OilMartQuotationStatus.APPROVED || status == OilMartQuotationStatus.CANCELLED) {
            throw new BusinessRuleException("OILMART_QUOTATION_ILLEGAL_TRANSITION",
                    "An %s quotation cannot be cancelled".formatted(status));
        }
        this.status = OilMartQuotationStatus.CANCELLED;
        this.cancellationReason = reason;
    }

    public boolean isEditable() {
        return status == OilMartQuotationStatus.DRAFT || status == OilMartQuotationStatus.REJECTED;
    }

    public boolean isExpired() {
        return validUntil.isBefore(LocalDate.now());
    }

    private void resubmit() {
        this.status = OilMartQuotationStatus.PENDING_APPROVAL;
        this.submittedAt = Instant.now();
        this.approvedByUserId = null;
        this.approvedAt = null;
        this.rejectedByUserId = null;
        this.rejectedAt = null;
        this.rejectionReason = null;
    }

    private void recalculateTotals() {
        this.subtotal = lines.stream()
                .map(OilMartQuotationLine::getLineTotal)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        this.gstAmount = subtotal.multiply(gstRatePercent)
                .divide(HUNDRED, MONEY_SCALE, RoundingMode.HALF_UP);
        this.grandTotal = subtotal.add(gstAmount);
        this.totalCost = lines.stream()
                .map(OilMartQuotationLine::getLineCost)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        this.totalProfit = lines.stream()
                .map(OilMartQuotationLine::getLineProfit)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }

    private void requireEditable() {
        if (!isEditable()) {
            throw new BusinessRuleException("OILMART_QUOTATION_NOT_EDITABLE",
                    "Only a DRAFT or REJECTED quotation can be edited (current: %s)".formatted(status));
        }
    }

    private void requireLines() {
        if (lines.isEmpty()) {
            throw new BusinessRuleException("OILMART_QUOTATION_EMPTY",
                    "A quotation needs at least one line");
        }
    }

    private void requireNotExpired() {
        if (isExpired()) {
            throw new BusinessRuleException("OILMART_QUOTATION_EXPIRED",
                    "This quotation is not valid now, it needs to be edited with current dates "
                            + "(valid until %s)".formatted(validUntil));
        }
    }

    private void requireValidityWindow() {
        if (issuedDate == null || validUntil == null) {
            throw new BusinessRuleException("OILMART_QUOTATION_INVALID_DATES",
                    "A quotation needs an issued date and a valid-until date");
        }
        if (validUntil.isBefore(issuedDate)) {
            throw new BusinessRuleException("OILMART_QUOTATION_INVALID_DATES",
                    "Valid-until (%s) cannot be before the issued date (%s)"
                            .formatted(validUntil, issuedDate));
        }
    }

    private void requireStatus(OilMartQuotationStatus expected, String action) {
        if (status != expected) {
            throw new BusinessRuleException("OILMART_QUOTATION_ILLEGAL_TRANSITION",
                    "Only a %s quotation can be %s (current: %s)".formatted(expected, action, status));
        }
    }
}
