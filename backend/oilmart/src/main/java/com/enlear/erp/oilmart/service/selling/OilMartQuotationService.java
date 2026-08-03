package com.enlear.erp.oilmart.service.selling;

import com.enlear.erp.oilmart.config.OilMartProperties;
import com.enlear.erp.oilmart.model.OilMartClient;
import com.enlear.erp.oilmart.model.OilMartDocumentType;
import com.enlear.erp.oilmart.model.OilMartItem;
import com.enlear.erp.oilmart.model.OilMartItemPrice;
import com.enlear.erp.oilmart.model.OilMartQuotation;
import com.enlear.erp.oilmart.model.OilMartQuotationStatus;
import com.enlear.erp.oilmart.repository.OilMartQuotationRepository;
import com.enlear.erp.oilmart.service.OilMartCurrentUser;
import com.enlear.erp.oilmart.service.OilMartDocumentNumberService;
import com.enlear.erp.oilmart.service.command.SaveOilMartQuotationCommand;
import com.enlear.erp.oilmart.service.master.OilMartClientService;
import com.enlear.erp.oilmart.service.master.OilMartItemService;
import com.enlear.erp.oilmart.service.master.OilMartPriceService;
import com.enlear.erp.oilmart.service.stock.OilMartStockService;
import com.enlear.erp.shared.error.BusinessRuleException;
import com.enlear.erp.shared.error.ResourceNotFoundException;
import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import org.hibernate.Hibernate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
public class OilMartQuotationService {

    private final OilMartQuotationRepository quotations;
    private final OilMartClientService clients;
    private final OilMartItemService items;
    private final OilMartPriceService prices;
    private final OilMartStockService stock;
    private final OilMartDocumentNumberService documentNumbers;
    private final OilMartCurrentUser currentUser;
    private final OilMartProperties properties;

    public OilMartQuotationService(OilMartQuotationRepository quotations,
                                   OilMartClientService clients,
                                   OilMartItemService items,
                                   OilMartPriceService prices,
                                   OilMartStockService stock,
                                   OilMartDocumentNumberService documentNumbers,
                                   OilMartCurrentUser currentUser,
                                   OilMartProperties properties) {
        this.quotations = quotations;
        this.clients = clients;
        this.items = items;
        this.prices = prices;
        this.stock = stock;
        this.documentNumbers = documentNumbers;
        this.currentUser = currentUser;
        this.properties = properties;
    }

    public OilMartQuotation create(SaveOilMartQuotationCommand cmd) {
        OilMartClient client = requireActiveClient(cmd.clientId());
        requireLines(cmd);

        OilMartQuotation quotation = new OilMartQuotation(
                documentNumbers.next(OilMartDocumentType.QT),
                client.getId(),
                currentUser.requireId(),
                cmd.issuedDate(),
                cmd.validUntil(),
                properties.gstRatePercent(),
                cmd.note());

        applyLines(quotation, cmd);
        return quotations.save(quotation);
    }

    public OilMartQuotation revise(UUID id, SaveOilMartQuotationCommand cmd,
                                   Instant expectedUpdatedAt) {
        OilMartQuotation quotation = lockForUpdate(id, expectedUpdatedAt);
        requireActiveClient(cmd.clientId());
        requireLines(cmd);

        boolean wasRejected = quotation.getStatus() == OilMartQuotationStatus.REJECTED;
        quotation.beginRevision(cmd.issuedDate(), cmd.validUntil(), cmd.note());
        applyLines(quotation, cmd);
        if (wasRejected) {
            quotation.submitForApproval();
        }
        return quotations.save(quotation);
    }

    public OilMartQuotation submitForApproval(UUID id, Instant expectedUpdatedAt) {
        OilMartQuotation quotation = lockForUpdate(id, expectedUpdatedAt);
        quotation.submitForApproval();
        return quotations.save(quotation);
    }

    public OilMartQuotation approve(UUID id, Instant expectedUpdatedAt) {
        OilMartQuotation quotation = lockForUpdate(id, expectedUpdatedAt);
        quotation.approve(currentUser.requireId());
        return quotations.save(quotation);
    }

    public OilMartQuotation reject(UUID id, String reason, Instant expectedUpdatedAt) {
        OilMartQuotation quotation = lockForUpdate(id, expectedUpdatedAt);
        quotation.reject(currentUser.requireId(), reason);
        return quotations.save(quotation);
    }

    public OilMartQuotation cancel(UUID id, String reason, Instant expectedUpdatedAt) {
        OilMartQuotation quotation = lockForUpdate(id, expectedUpdatedAt);
        quotation.cancel(reason);
        return quotations.save(quotation);
    }

    private OilMartQuotation lockForUpdate(UUID id, Instant expectedUpdatedAt) {
        OilMartQuotation quotation = quotations.findByIdForUpdate(id)
                .orElseThrow(() -> new ResourceNotFoundException("OilMartQuotation", id));
        quotation.requireUnchangedSince(expectedUpdatedAt);
        Hibernate.initialize(quotation.getLines());
        return quotation;
    }

    @Transactional(readOnly = true)
    public OilMartQuotation get(UUID id) {
        OilMartQuotation quotation = quotations.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("OilMartQuotation", id));
        Hibernate.initialize(quotation.getLines());
        return quotation;
    }

    @Transactional(readOnly = true)
    public List<OilMartQuotation> list(OilMartQuotationStatus status) {
        List<OilMartQuotation> found = status == null
                ? quotations.findAllByOrderByIssuedDateDescQuotationNoDesc()
                : quotations.findByStatusOrderByIssuedDateDescQuotationNoDesc(status);
        found.forEach(quotation -> Hibernate.initialize(quotation.getLines()));
        return found;
    }

    @Transactional(readOnly = true)
    public List<OilMartQuotation> listByClient(UUID clientId) {
        List<OilMartQuotation> found =
                quotations.findByClientIdOrderByIssuedDateDescQuotationNoDesc(clientId);
        found.forEach(quotation -> Hibernate.initialize(quotation.getLines()));
        return found;
    }

    private void applyLines(OilMartQuotation quotation, SaveOilMartQuotationCommand cmd) {
        LocalDate pricedOn = cmd.issuedDate();
        requireStockCovers(cmd);

        for (SaveOilMartQuotationCommand.Line line : cmd.lines()) {
            OilMartItem item = items.get(line.itemId());
            if (!item.isActive()) {
                throw new BusinessRuleException("OILMART_ITEM_INACTIVE",
                        "%s is inactive and cannot be quoted".formatted(item.getName()));
            }

            OilMartItemPrice price = prices.effectivePriceOn(item.getId(), pricedOn).orElse(null);
            BigDecimal listUnitPrice = line.listUnitPrice() != null
                    ? line.listUnitPrice()
                    : OilMartPriceService.sellPriceOrZero(price);
            BigDecimal unitPrice = line.unitPrice() != null ? line.unitPrice() : listUnitPrice;
            if (unitPrice.signum() <= 0) {
                throw new BusinessRuleException("OILMART_QUOTATION_NO_PRICE",
                        "No price is configured for %s on %s".formatted(item.getName(), pricedOn));
            }
            BigDecimal unitCost = price != null ? price.getBuyPrice() : BigDecimal.ZERO;

            quotation.addLine(item.getId(), line.quantityLitres(), listUnitPrice, unitPrice,
                    line.discountPercent(), unitCost);
        }
    }

    private void requireStockCovers(SaveOilMartQuotationCommand cmd) {
        Map<UUID, BigDecimal> requestedByItem = new HashMap<>();
        for (SaveOilMartQuotationCommand.Line line : cmd.lines()) {
            if (line.quantityLitres() == null || line.quantityLitres().signum() <= 0) {
                throw new BusinessRuleException("OILMART_QUOTATION_INVALID_QUANTITY",
                        "Each quotation line needs a quantity greater than zero");
            }
            requestedByItem.merge(line.itemId(), line.quantityLitres(), BigDecimal::add);
        }
        requestedByItem.forEach((itemId, requested) -> {
            BigDecimal onHand = stock.onHand(itemId);
            if (requested.compareTo(onHand) > 0) {
                throw new BusinessRuleException("OILMART_INSUFFICIENT_STOCK",
                        "Only %s L of %s is in stock, %s L was requested".formatted(
                                onHand.stripTrailingZeros().toPlainString(),
                                items.get(itemId).getName(),
                                requested.stripTrailingZeros().toPlainString()));
            }
        });
    }

    private OilMartClient requireActiveClient(UUID clientId) {
        OilMartClient client = clients.get(clientId);
        if (!client.isActive()) {
            throw new BusinessRuleException("OILMART_CLIENT_INACTIVE",
                    "%s is inactive and cannot be quoted".formatted(client.getName()));
        }
        return client;
    }

    private void requireLines(SaveOilMartQuotationCommand cmd) {
        if (cmd.lines() == null || cmd.lines().isEmpty()) {
            throw new BusinessRuleException("OILMART_QUOTATION_EMPTY",
                    "A quotation needs at least one line");
        }
    }
}
