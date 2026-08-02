package com.enlear.erp.oilmart.service.selling;

import com.enlear.erp.oilmart.model.OilMartClient;
import com.enlear.erp.oilmart.model.OilMartDocumentType;
import com.enlear.erp.oilmart.model.OilMartItem;
import com.enlear.erp.oilmart.model.OilMartMovementReferenceType;
import com.enlear.erp.oilmart.model.OilMartMovementType;
import com.enlear.erp.oilmart.model.OilMartPaymentMethod;
import com.enlear.erp.oilmart.model.OilMartSale;
import com.enlear.erp.oilmart.model.OilMartSaleStatus;
import com.enlear.erp.oilmart.repository.OilMartSaleRepository;
import com.enlear.erp.oilmart.service.OilMartCurrentUser;
import com.enlear.erp.oilmart.service.OilMartDocumentNumberService;
import com.enlear.erp.oilmart.service.command.CreateOilMartSaleCommand;
import com.enlear.erp.oilmart.service.command.DispatchOilMartSaleCommand;
import com.enlear.erp.oilmart.service.master.OilMartClientService;
import com.enlear.erp.oilmart.service.master.OilMartItemService;
import com.enlear.erp.oilmart.service.master.OilMartPriceService;
import com.enlear.erp.oilmart.service.stock.OilMartStockService;
import com.enlear.erp.shared.error.BusinessRuleException;
import com.enlear.erp.shared.error.ResourceNotFoundException;
import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneOffset;
import java.util.List;
import java.util.UUID;
import org.hibernate.Hibernate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
public class OilMartSaleService {

    private final OilMartSaleRepository sales;
    private final OilMartClientService clients;
    private final OilMartItemService items;
    private final OilMartPriceService prices;
    private final OilMartStockService stock;
    private final OilMartDocumentNumberService documentNumbers;
    private final OilMartCurrentUser currentUser;

    public OilMartSaleService(OilMartSaleRepository sales,
                              OilMartClientService clients,
                              OilMartItemService items,
                              OilMartPriceService prices,
                              OilMartStockService stock,
                              OilMartDocumentNumberService documentNumbers,
                              OilMartCurrentUser currentUser) {
        this.sales = sales;
        this.clients = clients;
        this.items = items;
        this.prices = prices;
        this.stock = stock;
        this.documentNumbers = documentNumbers;
        this.currentUser = currentUser;
    }

    public OilMartSale createQuotation(CreateOilMartSaleCommand cmd) {
        OilMartClient client = clients.get(cmd.clientId());
        if (!client.isActive()) {
            throw new BusinessRuleException("OILMART_CLIENT_INACTIVE",
                    "%s is inactive and cannot be quoted".formatted(client.getName()));
        }
        if (cmd.lines() == null || cmd.lines().isEmpty()) {
            throw new BusinessRuleException("OILMART_SALE_EMPTY",
                    "A sale needs at least one line");
        }

        Instant quotedAt = cmd.quotedAt() != null ? cmd.quotedAt() : Instant.now();
        OilMartSale sale = new OilMartSale(
                documentNumbers.next(OilMartDocumentType.QT),
                client.getId(),
                currentUser.requireId(),
                quotedAt,
                cmd.validUntil(),
                cmd.discountAmount(),
                cmd.note());

        LocalDate pricedOn = quotedAt.atZone(ZoneOffset.UTC).toLocalDate();
        for (CreateOilMartSaleCommand.Line line : cmd.lines()) {
            OilMartItem item = items.get(line.itemId());
            if (!item.isActive()) {
                throw new BusinessRuleException("OILMART_ITEM_INACTIVE",
                        "%s is inactive and cannot be sold".formatted(item.getName()));
            }
            if (line.quantityLitres() == null || line.quantityLitres().signum() <= 0) {
                throw new BusinessRuleException("OILMART_SALE_INVALID_QUANTITY",
                        "Each sale line needs a quantity greater than zero");
            }

            BigDecimal listUnitPrice = line.listUnitPrice() != null
                    ? line.listUnitPrice()
                    : prices.effectivePriceOn(item.getId(), pricedOn)
                            .map(price -> price.getSellPrice())
                            .orElse(BigDecimal.ZERO);

            BigDecimal unitPrice = line.unitPrice() != null ? line.unitPrice() : listUnitPrice;
            if (unitPrice.signum() <= 0) {
                throw new BusinessRuleException("OILMART_SALE_NO_PRICE",
                        "No price is configured for %s on %s".formatted(item.getName(), pricedOn));
            }

            sale.addLine(item.getId(), line.quantityLitres(), listUnitPrice, unitPrice,
                    line.discountPercent());
        }

        return sales.save(sale);
    }

    public OilMartSale submitForApproval(UUID id) {
        OilMartSale sale = get(id);
        sale.submitForApproval();
        return sales.save(sale);
    }

    public OilMartSale approveQuotation(UUID id) {
        OilMartSale sale = get(id);
        sale.approveQuotation(currentUser.requireId(), documentNumbers.next(OilMartDocumentType.SO));
        return sales.save(sale);
    }

    public OilMartSale rejectQuotation(UUID id, String reason) {
        OilMartSale sale = get(id);
        sale.rejectQuotation(currentUser.requireId(), reason);
        return sales.save(sale);
    }

    public OilMartSale approve(UUID id) {
        OilMartSale sale = get(id);
        sale.approve(currentUser.requireId());
        return sales.save(sale);
    }

    public OilMartSale reject(UUID id, String reason) {
        OilMartSale sale = get(id);
        sale.reject(currentUser.requireId(), reason);
        return sales.save(sale);
    }

    public OilMartSale dispatch(UUID id, DispatchOilMartSaleCommand cmd) {
        OilMartSale sale = get(id);
        UUID userId = currentUser.requireId();

        sale.dispatch(userId, cmd.vehicleNo(), cmd.driverName());

        sale.getLines().forEach(line -> stock.apply(
                line.getItemId(),
                line.getQuantityLitres().negate(),
                OilMartMovementType.SALE,
                OilMartMovementReferenceType.SALE,
                sale.getId(),
                sale.getSaleNo(),
                userId,
                cmd.note()));

        return sales.save(sale);
    }

    public OilMartSale raiseInvoice(UUID id, OilMartPaymentMethod paymentMethod) {
        OilMartSale sale = get(id);
        sale.raiseInvoice(documentNumbers.next(OilMartDocumentType.INV),
                currentUser.requireId(), paymentMethod);
        return sales.save(sale);
    }

    public OilMartSale cancel(UUID id, String reason) {
        OilMartSale sale = get(id);
        sale.cancel(reason);
        return sales.save(sale);
    }

    @Transactional(readOnly = true)
    public OilMartSale get(UUID id) {
        OilMartSale sale = sales.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("OilMartSale", id));
        Hibernate.initialize(sale.getLines());
        return sale;
    }

    @Transactional(readOnly = true)
    public List<OilMartSale> list(OilMartSaleStatus status) {
        List<OilMartSale> found = status == null
                ? sales.findAllByOrderByQuotedAtDesc()
                : sales.findByStatusOrderByQuotedAtDesc(status);
        found.forEach(sale -> Hibernate.initialize(sale.getLines()));
        return found;
    }

    @Transactional(readOnly = true)
    public List<OilMartSale> listByClient(UUID clientId) {
        List<OilMartSale> found = sales.findByClientIdOrderByQuotedAtDesc(clientId);
        found.forEach(sale -> Hibernate.initialize(sale.getLines()));
        return found;
    }
}
