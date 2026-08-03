package com.enlear.erp.oilmart.service.master;

import com.enlear.erp.oilmart.model.OilMartItemPrice;
import com.enlear.erp.oilmart.repository.OilMartItemPriceRepository;
import com.enlear.erp.oilmart.service.command.AddOilMartItemPriceCommand;
import com.enlear.erp.shared.error.BusinessRuleException;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;
import java.util.function.Function;
import java.util.stream.Collectors;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
public class OilMartPriceService {

    private final OilMartItemPriceRepository prices;

    public OilMartPriceService(OilMartItemPriceRepository prices) {
        this.prices = prices;
    }

    public OilMartItemPrice addPrice(AddOilMartItemPriceCommand cmd) {
        validate(cmd);

        Optional<OilMartItemPrice> latest =
                prices.findTopByItemIdOrderByEffectiveFromDesc(cmd.itemId());
        if (latest.isPresent()) {
            OilMartItemPrice previous = latest.get();
            if (!cmd.effectiveFrom().isAfter(previous.getEffectiveFrom())) {
                throw new BusinessRuleException("OILMART_PRICE_RANGE_OVERLAP",
                        "A new price must start after the current price period (%s)"
                                .formatted(previous.getEffectiveFrom()));
            }
            if (previous.getEffectiveTo() == null
                    || !previous.getEffectiveTo().isBefore(cmd.effectiveFrom())) {
                previous.closeOn(cmd.effectiveFrom().minusDays(1));
                prices.save(previous);
            }
        }

        return prices.save(new OilMartItemPrice(cmd.itemId(), cmd.buyPrice(), cmd.sellPrice(),
                cmd.effectiveFrom(), cmd.effectiveTo(), cmd.recordedByUserId(), cmd.note()));
    }

    @Transactional(readOnly = true)
    public List<OilMartItemPrice> history(UUID itemId) {
        return prices.findByItemIdOrderByEffectiveFromDesc(itemId);
    }

    @Transactional(readOnly = true)
    public Optional<OilMartItemPrice> effectivePriceOn(UUID itemId, LocalDate date) {
        return prices.findEffectiveOn(itemId, date == null ? LocalDate.now() : date);
    }

    @Transactional(readOnly = true)
    public Map<UUID, OilMartItemPrice> effectivePricesOn(LocalDate date) {
        return prices.findAllEffectiveOn(date == null ? LocalDate.now() : date).stream()
                .collect(Collectors.toMap(OilMartItemPrice::getItemId, Function.identity(),
                        (first, second) ->
                                first.getEffectiveFrom().isAfter(second.getEffectiveFrom()) ? first : second));
    }

    private void validate(AddOilMartItemPriceCommand cmd) {
        if (cmd.buyPrice() == null || cmd.buyPrice().signum() < 0) {
            throw new BusinessRuleException("OILMART_INVALID_PRICE",
                    "Buy price must be zero or more");
        }
        if (cmd.sellPrice() == null || cmd.sellPrice().signum() < 0) {
            throw new BusinessRuleException("OILMART_INVALID_PRICE",
                    "Sell price must be zero or more");
        }
        if (cmd.effectiveFrom() == null) {
            throw new BusinessRuleException("OILMART_INVALID_PRICE_RANGE",
                    "Effective-from is required");
        }
        if (cmd.effectiveTo() != null && cmd.effectiveTo().isBefore(cmd.effectiveFrom())) {
            throw new BusinessRuleException("OILMART_INVALID_PRICE_RANGE",
                    "Effective-to must be on or after effective-from");
        }
    }

    public static BigDecimal sellPriceOrZero(OilMartItemPrice price) {
        return price == null ? BigDecimal.ZERO : price.getSellPrice();
    }
}
