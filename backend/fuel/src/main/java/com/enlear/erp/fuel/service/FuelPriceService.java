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
 * Append-only fuel-price history. New rows carry an explicit date range and may
 * not overlap an existing one; existing rows are never updated or deleted.
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
        if (cmd.effectiveFrom() == null || cmd.effectiveTo() == null
                || cmd.effectiveTo().isBefore(cmd.effectiveFrom())) {
            throw new BusinessRuleException("FUEL_INVALID_PRICE_RANGE",
                    "Effective-to must be on or after effective-from");
        }
        if (prices.countOverlapping(cmd.effectiveFrom(), cmd.effectiveTo()) > 0) {
            throw new BusinessRuleException("FUEL_PRICE_RANGE_OVERLAP",
                    "The date range %s – %s overlaps an existing price"
                            .formatted(cmd.effectiveFrom(), cmd.effectiveTo()));
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
