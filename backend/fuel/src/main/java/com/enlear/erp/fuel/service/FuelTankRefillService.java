package com.enlear.erp.fuel.service;

import com.enlear.erp.fuel.model.FuelTank;
import com.enlear.erp.fuel.model.FuelTankRefill;
import com.enlear.erp.fuel.repository.FuelTankRefillRepository;
import com.enlear.erp.fuel.service.command.RecordRefillCommand;
import com.enlear.erp.shared.error.BusinessRuleException;
import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;
import java.util.UUID;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/** Records fuel deliveries into a tank and adds them to the tank's level. */
@Service
@Transactional
public class FuelTankRefillService {

    private final FuelTankRefillRepository refills;
    private final FuelTankService tankService;

    public FuelTankRefillService(FuelTankRefillRepository refills, FuelTankService tankService) {
        this.refills = refills;
        this.tankService = tankService;
    }

    public FuelTankRefill recordRefill(RecordRefillCommand cmd) {
        if (cmd.litres() == null || cmd.litres().signum() <= 0) {
            throw new BusinessRuleException("FUEL_INVALID_REFILL_QUANTITY",
                    "Refill litres must be a positive number");
        }
        FuelTank tank = tankService.lockTank(cmd.tankId());
        Instant refilledAt = Instant.now();

        tank.adjustLevel(cmd.litres());
        tankService.save(tank);

        FuelTankRefill refill = new FuelTankRefill(tank.getId(), cmd.litres(), refilledAt,
                cmd.recordedByUserId(), cmd.note());
        return refills.save(refill);
    }

    @Transactional(readOnly = true)
    public List<FuelTankRefill> listForTank(UUID tankId) {
        return refills.findByTankIdOrderByRefilledAtDesc(tankId);
    }

    @Transactional(readOnly = true)
    public BigDecimal sumLitresBetween(UUID tankId, Instant from, Instant to) {
        return refills.sumLitresBetween(tankId, from, to);
    }
}
