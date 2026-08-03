package com.enlear.erp.oilmart.service.overview;

import com.enlear.erp.oilmart.model.OilMartItem;
import com.enlear.erp.oilmart.model.OilMartItemPrice;
import com.enlear.erp.oilmart.model.OilMartItemStore;
import com.enlear.erp.oilmart.repository.OilMartItemRepository;
import com.enlear.erp.oilmart.service.master.OilMartPriceService;
import com.enlear.erp.oilmart.service.stock.OilMartStockService;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.function.Function;
import java.util.stream.Collectors;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional(readOnly = true)
public class OilMartStockQueryService {

    private final OilMartStockService stock;
    private final OilMartItemRepository items;
    private final OilMartPriceService prices;

    public OilMartStockQueryService(OilMartStockService stock,
                                    OilMartItemRepository items,
                                    OilMartPriceService prices) {
        this.stock = stock;
        this.items = items;
        this.prices = prices;
    }

    public List<OilMartStockView> balances() {
        Map<UUID, OilMartItem> itemsById = items.findAll().stream()
                .collect(Collectors.toMap(OilMartItem::getId, Function.identity()));
        Map<UUID, OilMartItemPrice> pricesByItem = prices.effectivePricesOn(LocalDate.now());

        return stock.balances().stream()
                .map(balance -> toView(balance, itemsById.get(balance.getItemId()),
                        pricesByItem.get(balance.getItemId())))
                .filter(view -> view != null)
                .sorted(Comparator.comparing(OilMartStockView::itemName))
                .toList();
    }

    public List<OilMartStockView> lowStock() {
        return balances().stream().filter(OilMartStockView::isLow).toList();
    }

    public BigDecimal totalStockValue() {
        return balances().stream()
                .map(OilMartStockView::stockValue)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }

    private OilMartStockView toView(OilMartItemStore balance, OilMartItem item, OilMartItemPrice price) {
        if (item == null) {
            return null;
        }
        BigDecimal buyPrice = price != null ? price.getBuyPrice() : null;
        BigDecimal stockValue = buyPrice == null
                ? BigDecimal.ZERO
                : balance.getQuantityOnHand().multiply(buyPrice).setScale(4, RoundingMode.HALF_UP);

        return new OilMartStockView(
                item.getId(),
                item.getCode(),
                item.getName(),
                item.getOilType(),
                balance.getQuantityOnHand(),
                item.getReorderLevelLitres(),
                buyPrice,
                price != null ? price.getSellPrice() : null,
                stockValue,
                balance.getLastMovementAt());
    }
}
