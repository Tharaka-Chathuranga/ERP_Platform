package com.enlear.erp.fuel.service;

import com.enlear.erp.fuel.model.FuelTank;
import com.enlear.erp.fuel.model.FuelTankPurpose;
import com.enlear.erp.fuel.repository.FuelTankRepository;
import com.enlear.erp.shared.error.BusinessRuleException;
import com.enlear.erp.shared.error.ResourceNotFoundException;
import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Reads tank master data and maintains the running level projection. Level
 * changes write-lock the tank row so concurrent refills / readings / vehicle
 * issues serialise, mirroring the store's stock-movement locking.
 */
@Service
@Transactional
public class FuelTankService {

    private final FuelTankRepository tanks;

    public FuelTankService(FuelTankRepository tanks) {
        this.tanks = tanks;
    }

    @Transactional(readOnly = true)
    public List<FuelTank> listTanks() {
        return tanks.findAllByOrderByPurposeAsc();
    }

    @Transactional(readOnly = true)
    public FuelTank getTank(UUID id) {
        return tanks.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("FuelTank", id));
    }

    @Transactional(readOnly = true)
    public FuelTank getTankByPurpose(FuelTankPurpose purpose) {
        return tanks.findByPurpose(purpose)
                .orElseThrow(() -> new ResourceNotFoundException("FuelTank", purpose));
    }

    public FuelTank updateDetails(UUID id, String name, BigDecimal capacityLitres) {
        FuelTank tank = getTank(id);
        tank.updateDetails(name, capacityLitres);
        return tanks.save(tank);
    }

    /** Load and write-lock a tank, failing if it does not exist. */
    public FuelTank lockTank(UUID id) {
        return tanks.findByIdForUpdate(id)
                .orElseThrow(() -> new ResourceNotFoundException("FuelTank", id));
    }

    /** Load and write-lock the single tank of a given purpose. */
    public FuelTank lockTankByPurpose(FuelTankPurpose purpose) {
        return tanks.findByPurposeForUpdate(purpose)
                .orElseThrow(() -> new BusinessRuleException("FUEL_TANK_MISSING",
                        "No %s fuel tank is configured".formatted(purpose)));
    }

    public FuelTank save(FuelTank tank) {
        return tanks.save(tank);
    }
}
