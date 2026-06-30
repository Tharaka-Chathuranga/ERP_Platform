package com.enlear.erp.fuel.service;

import com.enlear.erp.fuel.model.FuelPrice;
import com.enlear.erp.fuel.repository.FuelPriceRepository;
import com.enlear.erp.fuel.service.command.CreateFuelPriceCommand;
import com.enlear.erp.shared.error.BusinessRuleException;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Fuel-price history. The newest price is open-ended ({@code effectiveTo} null)
 * and counts as the current price. Adding a new price automatically closes the
 * previous one on the day before the new price starts, so {@code effectiveTo} is
 * optional and ranges never overlap.
 */
@Service
@Transactional
public class FuelPriceService {

    private final FuelPriceRepository prices;

    public FuelPriceService(FuelPriceRepository prices) {
        this.prices = prices;
    }

    public FuelPrice addPrice(CreateFuelPriceCommand cmd) {
        if (cmd.unitPrice() == null || cmd.unitPrice().signum() < 0) {
            throw new BusinessRuleException("FUEL_INVALID_PRICE",
                    "Unit price must be zero or more");
        }
        if (cmd.effectiveFrom() == null) {
            throw new BusinessRuleException("FUEL_INVALID_PRICE_RANGE",
                    "Effective-from is required");
        }
        if (cmd.effectiveTo() != null && cmd.effectiveTo().isBefore(cmd.effectiveFrom())) {
            throw new BusinessRuleException("FUEL_INVALID_PRICE_RANGE",
                    "Effective-to must be on or after effective-from");
        }

        // Close the most recent price so the new one supersedes it from its start date.
        Optional<FuelPrice> latest = prices.findTopByOrderByEffectiveFromDesc();
        if (latest.isPresent()) {
            FuelPrice previous = latest.get();
            if (!cmd.effectiveFrom().isAfter(previous.getEffectiveFrom())) {
                throw new BusinessRuleException("FUEL_PRICE_RANGE_OVERLAP",
                        "A new price must start after the most recent price (%s)"
                                .formatted(previous.getEffectiveFrom()));
            }
            if (previous.getEffectiveTo() == null
                    || !previous.getEffectiveTo().isBefore(cmd.effectiveFrom())) {
                previous.closeOn(cmd.effectiveFrom().minusDays(1));
                prices.save(previous);
            }
        }

        FuelPrice price = new FuelPrice(cmd.unitPrice(), cmd.effectiveFrom(), cmd.effectiveTo(),
                cmd.recordedByUserId(), cmd.note());
        return prices.save(price);
    }

    @Transactional(readOnly = true)
    public List<FuelPrice> listHistory() {
        return prices.findAllByOrderByEffectiveFromDesc();
    }

    @Transactional(readOnly = true)
    public Optional<FuelPrice> priceOn(LocalDate date) {
        return prices.findEffectiveOn(date);
    }
}
