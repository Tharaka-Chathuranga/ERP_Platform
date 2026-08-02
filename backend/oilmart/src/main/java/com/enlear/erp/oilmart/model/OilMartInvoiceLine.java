package com.enlear.erp.oilmart.model;

import com.enlear.erp.shared.model.BaseEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import java.math.BigDecimal;
import java.util.UUID;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "oil_mart_invoice_lines", schema = "oilmart")
@Getter
@NoArgsConstructor
public class OilMartInvoiceLine extends BaseEntity {

    @Column(name = "item_id", nullable = false)
    private UUID itemId;

    @Column(name = "quantity_litres", nullable = false, precision = 19, scale = 4)
    private BigDecimal quantityLitres;

    @Column(name = "list_unit_price", nullable = false, precision = 19, scale = 4)
    private BigDecimal listUnitPrice = BigDecimal.ZERO;

    @Column(name = "unit_price", nullable = false, precision = 19, scale = 4)
    private BigDecimal unitPrice;

    @Column(name = "is_price_override", nullable = false)
    private boolean priceOverride;

    @Column(name = "discount_percent", nullable = false, precision = 5, scale = 2)
    private BigDecimal discountPercent = BigDecimal.ZERO;

    @Column(name = "line_total", nullable = false, precision = 19, scale = 4)
    private BigDecimal lineTotal = BigDecimal.ZERO;

    @Column(name = "unit_cost", nullable = false, precision = 19, scale = 4)
    private BigDecimal unitCost = BigDecimal.ZERO;

    @Column(name = "line_cost", nullable = false, precision = 19, scale = 4)
    private BigDecimal lineCost = BigDecimal.ZERO;

    @Column(name = "line_profit", nullable = false, precision = 19, scale = 4)
    private BigDecimal lineProfit = BigDecimal.ZERO;

    OilMartInvoiceLine(OilMartQuotationLine source) {
        this.itemId = source.getItemId();
        this.quantityLitres = source.getQuantityLitres();
        this.listUnitPrice = source.getListUnitPrice();
        this.unitPrice = source.getUnitPrice();
        this.priceOverride = source.isPriceOverride();
        this.discountPercent = source.getDiscountPercent();
        this.lineTotal = source.getLineTotal();
        this.unitCost = source.getUnitCost();
        this.lineCost = source.getLineCost();
        this.lineProfit = source.getLineProfit();
    }
}
