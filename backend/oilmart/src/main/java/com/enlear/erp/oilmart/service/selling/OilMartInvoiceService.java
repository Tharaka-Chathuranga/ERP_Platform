package com.enlear.erp.oilmart.service.selling;

import com.enlear.erp.notification.exposed.NotificationApi;
import com.enlear.erp.notification.exposed.NotificationSeverity;
import com.enlear.erp.notification.exposed.NotificationType;
import com.enlear.erp.notification.exposed.dto.NotificationRequest;
import com.enlear.erp.oilmart.config.OilMartProperties;
import com.enlear.erp.oilmart.model.OilMartBankDetails;
import com.enlear.erp.oilmart.model.OilMartDocumentType;
import com.enlear.erp.oilmart.model.OilMartInvoice;
import com.enlear.erp.oilmart.model.OilMartInvoiceStatus;
import com.enlear.erp.oilmart.model.OilMartMovementReferenceType;
import com.enlear.erp.oilmart.model.OilMartMovementType;
import com.enlear.erp.oilmart.model.OilMartQuotation;
import com.enlear.erp.oilmart.model.OilMartQuotationStatus;
import com.enlear.erp.oilmart.repository.OilMartInvoiceRepository;
import com.enlear.erp.oilmart.service.OilMartCurrentUser;
import com.enlear.erp.oilmart.service.OilMartDocumentNumberService;
import com.enlear.erp.oilmart.service.command.CreateOilMartInvoiceCommand;
import com.enlear.erp.oilmart.service.stock.OilMartStockService;
import com.enlear.erp.shared.error.BusinessRuleException;
import com.enlear.erp.shared.error.ResourceNotFoundException;
import com.enlear.erp.user.exposed.UserApi;
import java.time.Instant;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;
import org.hibernate.Hibernate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
public class OilMartInvoiceService {

    private static final String SOURCE_MODULE = "oilmart";

    private final OilMartInvoiceRepository invoices;
    private final OilMartQuotationService quotations;
    private final OilMartStockService stock;
    private final OilMartDocumentNumberService documentNumbers;
    private final OilMartCurrentUser currentUser;
    private final OilMartProperties properties;
    private final NotificationApi notifications;
    private final UserApi users;

    public OilMartInvoiceService(OilMartInvoiceRepository invoices,
                                 OilMartQuotationService quotations,
                                 OilMartStockService stock,
                                 OilMartDocumentNumberService documentNumbers,
                                 OilMartCurrentUser currentUser,
                                 OilMartProperties properties,
                                 NotificationApi notifications,
                                 UserApi users) {
        this.invoices = invoices;
        this.quotations = quotations;
        this.stock = stock;
        this.documentNumbers = documentNumbers;
        this.currentUser = currentUser;
        this.properties = properties;
        this.notifications = notifications;
        this.users = users;
    }

    public OilMartInvoice create(CreateOilMartInvoiceCommand cmd) {
        OilMartQuotation quotation = requireInvoiceableQuotation(cmd.quotationId());
        LocalDate invoiceDate = cmd.invoiceDate() != null ? cmd.invoiceDate() : LocalDate.now();

        OilMartInvoice invoice = new OilMartInvoice(
                documentNumbers.next(OilMartDocumentType.IN),
                currentUser.requireId(),
                invoiceDate,
                bankDetails(),
                cmd.note(),
                quotation);

        return invoices.save(invoice);
    }

    public OilMartInvoice reselectQuotation(UUID id, UUID quotationId, Instant expectedUpdatedAt) {
        OilMartInvoice invoice = lockForUpdate(id, expectedUpdatedAt);
        OilMartQuotation quotation = requireInvoiceableQuotation(quotationId);
        invoice.reselectQuotation(quotation);
        return invoices.save(invoice);
    }

    public OilMartInvoice approve(UUID id, Instant expectedUpdatedAt) {
        OilMartInvoice invoice = lockForUpdate(id, expectedUpdatedAt);
        UUID approverId = currentUser.requireId();
        invoice.approve(approverId);

        invoice.getLines().forEach(line -> stock.apply(
                line.getItemId(),
                line.getQuantityLitres().negate(),
                OilMartMovementType.SALE,
                OilMartMovementReferenceType.INVOICE,
                invoice.getId(),
                invoice.getInvoiceNo(),
                approverId,
                null));

        return invoices.save(invoice);
    }

    public OilMartInvoice reject(UUID id, String reason, Instant expectedUpdatedAt) {
        OilMartInvoice invoice = lockForUpdate(id, expectedUpdatedAt);
        invoice.reject(currentUser.requireId(), reason);
        OilMartInvoice saved = invoices.save(invoice);
        notifyAuthorOfRejection(saved);
        return saved;
    }

    private OilMartInvoice lockForUpdate(UUID id, Instant expectedUpdatedAt) {
        OilMartInvoice invoice = invoices.findByIdForUpdate(id)
                .orElseThrow(() -> new ResourceNotFoundException("OilMartInvoice", id));
        invoice.requireUnchangedSince(expectedUpdatedAt);
        Hibernate.initialize(invoice.getLines());
        return invoice;
    }

    @Transactional(readOnly = true)
    public OilMartInvoice get(UUID id) {
        OilMartInvoice invoice = invoices.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("OilMartInvoice", id));
        Hibernate.initialize(invoice.getLines());
        return invoice;
    }

    @Transactional(readOnly = true)
    public List<OilMartInvoice> list(OilMartInvoiceStatus status) {
        List<OilMartInvoice> found = status == null
                ? invoices.findAllByOrderByInvoiceDateDescInvoiceNoDesc()
                : invoices.findByStatusOrderByInvoiceDateDescInvoiceNoDesc(status);
        found.forEach(invoice -> Hibernate.initialize(invoice.getLines()));
        return found;
    }

    @Transactional(readOnly = true)
    public List<OilMartInvoice> listByClient(UUID clientId) {
        List<OilMartInvoice> found = invoices.findByClientIdOrderByInvoiceDateDescInvoiceNoDesc(clientId);
        found.forEach(invoice -> Hibernate.initialize(invoice.getLines()));
        return found;
    }

    @Transactional(readOnly = true)
    public List<OilMartQuotation> invoiceableQuotations() {
        return quotations.list(OilMartQuotationStatus.APPROVED).stream()
                .filter(quotation -> !isAlreadyInvoiced(quotation.getId()))
                .toList();
    }

    private OilMartQuotation requireInvoiceableQuotation(UUID quotationId) {
        OilMartQuotation quotation = quotations.get(quotationId);
        if (quotation.getStatus() != OilMartQuotationStatus.APPROVED) {
            throw new BusinessRuleException("OILMART_QUOTATION_NOT_APPROVED",
                    "Only an APPROVED quotation can be invoiced (%s is %s)"
                            .formatted(quotation.getQuotationNo(), quotation.getStatus()));
        }
        if (quotation.isExpired()) {
            throw new BusinessRuleException("OILMART_QUOTATION_EXPIRED",
                    "This quotation is not valid now, it needs to be edited with current data "
                            + "(%s expired on %s)"
                            .formatted(quotation.getQuotationNo(), quotation.getValidUntil()));
        }
        if (isAlreadyInvoiced(quotationId)) {
            throw new BusinessRuleException("OILMART_QUOTATION_ALREADY_INVOICED",
                    "%s already has an invoice".formatted(quotation.getQuotationNo()));
        }
        return quotation;
    }

    private boolean isAlreadyInvoiced(UUID quotationId) {
        return invoices.existsByQuotationId(quotationId);
    }

    private void notifyAuthorOfRejection(OilMartInvoice invoice) {
        users.findById(invoice.getCreatedByUserId()).ifPresent(author -> notifications.raise(
                NotificationRequest.toUser(
                                author.username(),
                                NotificationType.DOCUMENT_REJECTED,
                                NotificationSeverity.WARNING,
                                "Invoice %s was rejected".formatted(invoice.getInvoiceNo()),
                                "%s was rejected: %s. Select the correct quotation for this invoice."
                                        .formatted(invoice.getInvoiceNo(), invoice.getRejectionReason()),
                                SOURCE_MODULE)
                        .withLink("/oil-mart/invoices/" + invoice.getId())));
    }

    private OilMartBankDetails bankDetails() {
        OilMartProperties.BankAccount bank = properties.bank();
        return new OilMartBankDetails(bank.accountName(), bank.bankName(), bank.branch(),
                bank.accountNumber(), bank.swiftCode());
    }
}
