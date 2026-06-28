package com.enlear.erp.fuel.service;

import com.enlear.erp.fuel.exposed.FuelApi;
import com.enlear.erp.fuel.exposed.dto.FuelPriceView;
import com.enlear.erp.fuel.exposed.dto.TankLevelView;
import com.enlear.erp.fuel.model.FuelTank;
import com.enlear.erp.fuel.model.FuelTankPurpose;
import java.time.LocalDate;
import java.util.Optional;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/** Read-only implementation of the cross-module fuel facade. */
@Service
@Transactional(readOnly = true)
public class FuelApiService implements FuelApi {

    private final FuelTankService tankService;
    private final FuelPriceService priceService;

    public FuelApiService(FuelTankService tankService, FuelPriceService priceService) {
        this.tankService = tankService;
        this.priceService = priceService;
    }

    @Override
    public TankLevelView tankLevel(FuelTankPurpose purpose) {
        FuelTank tank = tankService.getTankByPurpose(purpose);
        return new TankLevelView(tank.getId(), tank.getPurpose(),
                tank.getCurrentLitres(), tank.getCapacityLitres());
    }

    @Override
    public Optional<FuelPriceView> priceOn(LocalDate date) {
        return priceService.priceOn(date)
                .map(p -> new FuelPriceView(p.getUnitPrice(), p.getEffectiveFrom(), p.getEffectiveTo()));
    }
}
