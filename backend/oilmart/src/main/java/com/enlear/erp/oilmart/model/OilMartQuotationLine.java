package com.enlear.erp.oilmart.model;

import com.enlear.erp.shared.model.BaseEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.UUID;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "oil_mart_quotation_lines", schema = "oilmart")
@Getter
@NoArgsConstructor
public class OilMartQuotationLine extends BaseEntity {

    private static final BigDecimal HUNDRED = BigDecimal.valueOf(100);
    private static final int MONEY_SCALE = 4;

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

    public OilMartQuotationLine(UUID itemId, BigDecimal quantityLitres, BigDecimal listUnitPrice,
                                BigDecimal unitPrice, BigDecimal discountPercent, BigDecimal unitCost) {
        this.itemId = itemId;
        this.quantityLitres = quantityLitres;
        this.listUnitPrice = listUnitPrice != null ? listUnitPrice : BigDecimal.ZERO;
        this.unitPrice = unitPrice;
        this.discountPercent = discountPercent != null ? discountPercent : BigDecimal.ZERO;
        this.unitCost = unitCost != null ? unitCost : BigDecimal.ZERO;
        this.priceOverride = this.listUnitPrice.compareTo(BigDecimal.ZERO) > 0
                && this.listUnitPrice.compareTo(unitPrice) != 0;
        this.lineTotal = quantityLitres
                .multiply(unitPrice)
                .multiply(HUNDRED.subtract(this.discountPercent))
                .divide(HUNDRED, MONEY_SCALE, RoundingMode.HALF_UP);
        this.lineCost = quantityLitres.multiply(this.unitCost)
                .setScale(MONEY_SCALE, RoundingMode.HALF_UP);
        this.lineProfit = this.lineTotal.subtract(this.lineCost);
    }
}
