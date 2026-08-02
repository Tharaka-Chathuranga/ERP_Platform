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
@Table(name = "oil_mart_receipt_lines", schema = "oilmart")
@Getter
@NoArgsConstructor
public class OilMartReceiptLine extends BaseEntity {

    @Column(name = "item_id", nullable = false)
    private UUID itemId;

    @Column(name = "quantity_litres", nullable = false, precision = 19, scale = 4)
    private BigDecimal quantityLitres;

    @Column(name = "buy_unit_price", nullable = false, precision = 19, scale = 4)
    private BigDecimal buyUnitPrice;

    @Column(name = "line_total", nullable = false, precision = 19, scale = 4)
    private BigDecimal lineTotal = BigDecimal.ZERO;

    public OilMartReceiptLine(UUID itemId, BigDecimal quantityLitres, BigDecimal buyUnitPrice) {
        this.itemId = itemId;
        this.quantityLitres = quantityLitres;
        this.buyUnitPrice = buyUnitPrice;
        this.lineTotal = quantityLitres.multiply(buyUnitPrice).setScale(4, RoundingMode.HALF_UP);
    }
}
