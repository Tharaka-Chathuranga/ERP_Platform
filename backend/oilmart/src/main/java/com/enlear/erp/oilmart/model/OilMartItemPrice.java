package com.enlear.erp.oilmart.model;

import com.enlear.erp.shared.model.BaseEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "oil_mart_item_prices", schema = "oilmart")
@Getter
@NoArgsConstructor
public class OilMartItemPrice extends BaseEntity {

    @Column(name = "item_id", nullable = false)
    private UUID itemId;

    @Column(name = "buy_price", nullable = false, precision = 19, scale = 4)
    private BigDecimal buyPrice;

    @Column(name = "sell_price", nullable = false, precision = 19, scale = 4)
    private BigDecimal sellPrice;

    @Column(name = "effective_from", nullable = false)
    private LocalDate effectiveFrom;

    @Column(name = "effective_to")
    private LocalDate effectiveTo;

    @Column(name = "recorded_by_user_id", nullable = false)
    private UUID recordedByUserId;

    @Column(length = 1000)
    private String note;

    public OilMartItemPrice(UUID itemId, BigDecimal buyPrice, BigDecimal sellPrice,
                            LocalDate effectiveFrom, LocalDate effectiveTo,
                            UUID recordedByUserId, String note) {
        this.itemId = itemId;
        this.buyPrice = buyPrice;
        this.sellPrice = sellPrice;
        this.effectiveFrom = effectiveFrom;
        this.effectiveTo = effectiveTo;
        this.recordedByUserId = recordedByUserId;
        this.note = note;
    }

    public void closeOn(LocalDate endDate) {
        this.effectiveTo = endDate;
    }
}
