package com.enlear.erp.fuel.service;

import com.enlear.erp.fuel.model.FuelTank;
import com.enlear.erp.fuel.model.FuelTankReading;
import com.enlear.erp.fuel.repository.FuelTankReadingRepository;
import com.enlear.erp.fuel.service.command.RecordReadingCommand;
import com.enlear.erp.shared.error.BusinessRuleException;
import java.math.BigDecimal;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Records timed tank-level readings and reconciles the tank's running level to
 * the measured value. Also derives consumption between consecutive readings.
 */
@Service
@Transactional
public class FuelTankReadingService {

    private final FuelTankReadingRepository readings;
    private final FuelTankService tankService;
    private final FuelTankRefillService refillService;

    public FuelTankReadingService(FuelTankReadingRepository readings, FuelTankService tankService,
                                  FuelTankRefillService refillService) {
        this.readings = readings;
        this.tankService = tankService;
        this.refillService = refillService;
    }

    public FuelTankReading recordReading(RecordReadingCommand cmd) {
        if (cmd.litresMeasured() == null || cmd.litresMeasured().signum() < 0) {
            throw new BusinessRuleException("FUEL_INVALID_READING",
                    "Measured litres must be zero or more");
        }
        FuelTank tank = tankService.lockTank(cmd.tankId());
        Instant readingAt = Instant.now();

        tank.reconcileTo(cmd.litresMeasured());
        tankService.save(tank);

        FuelTankReading reading = new FuelTankReading(tank.getId(), cmd.litresMeasured(), readingAt,
                cmd.recordedByUserId(), cmd.note());
        return readings.save(reading);
    }

    /** Readings for a tank, newest first, each with consumption since the previous one. */
    @Transactional(readOnly = true)
    public List<ReadingWithConsumption> listForTankWithConsumption(UUID tankId) {
        List<FuelTankReading> ordered = readings.findByTankIdOrderByReadingAtDesc(tankId);
        List<ReadingWithConsumption> result = new ArrayList<>(ordered.size());
        for (int i = 0; i < ordered.size(); i++) {
            FuelTankReading current = ordered.get(i);
            FuelTankReading previous = i + 1 < ordered.size() ? ordered.get(i + 1) : null;
            result.add(new ReadingWithConsumption(current, consumption(tankId, previous, current)));
        }
        return result;
    }

    /** Consumption for the most recent reading of a tank, or null if not derivable. */
    @Transactional(readOnly = true)
    public ReadingWithConsumption latestForTank(UUID tankId) {
        FuelTankReading latest = readings.findFirstByTankIdOrderByReadingAtDesc(tankId).orElse(null);
        if (latest == null) {
            return null;
        }
        FuelTankReading previous = readings
                .findFirstByTankIdAndReadingAtLessThanOrderByReadingAtDesc(tankId, latest.getReadingAt())
                .orElse(null);
        return new ReadingWithConsumption(latest, consumption(tankId, previous, latest));
    }

    private BigDecimal consumption(UUID tankId, FuelTankReading previous, FuelTankReading current) {
        if (previous == null) {
            return null;
        }
        BigDecimal refilled = refillService.sumLitresBetween(
                tankId, previous.getReadingAt(), current.getReadingAt());
        return previous.getLitresMeasured().add(refilled).subtract(current.getLitresMeasured());
    }
}
