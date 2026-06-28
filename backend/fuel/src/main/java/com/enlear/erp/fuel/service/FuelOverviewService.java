package com.enlear.erp.fuel.service;

import com.enlear.erp.fuel.model.FuelPrice;
import com.enlear.erp.fuel.model.FuelTank;
import com.enlear.erp.fuel.model.FuelTankPurpose;
import com.enlear.erp.fuel.repository.VehicleFuelIssueRepository;
import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneId;
import java.util.List;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/** Assembles the fuel figures shown on the admin overview page. */
@Service
@Transactional(readOnly = true)
public class FuelOverviewService {

    private final FuelTankService tankService;
    private final VehicleFuelIssueRepository issues;
    private final FuelPriceService priceService;
    private final FuelTankReadingService readingService;

    public FuelOverviewService(FuelTankService tankService, VehicleFuelIssueRepository issues,
                               FuelPriceService priceService, FuelTankReadingService readingService) {
        this.tankService = tankService;
        this.issues = issues;
        this.priceService = priceService;
        this.readingService = readingService;
    }

    public FuelOverviewSnapshot snapshot() {
        LocalDate today = LocalDate.now();
        Instant from = today.atStartOfDay(ZoneId.systemDefault()).toInstant();
        Instant to = today.plusDays(1).atStartOfDay(ZoneId.systemDefault()).toInstant();

        List<FuelTank> tanks = tankService.listTanks();
        long todayCount = issues.countByIssuedAtBetween(from, to);
        BigDecimal todayLitres = issues.sumLitresIssuedBetween(from, to);
        FuelPrice currentPrice = priceService.priceOn(today).orElse(null);

        FuelTank internalTank = tanks.stream()
                .filter(t -> t.getPurpose() == FuelTankPurpose.INTERNAL)
                .findFirst()
                .orElse(null);
        ReadingWithConsumption lastInternalReading = internalTank != null
                ? readingService.latestForTank(internalTank.getId())
                : null;

        return new FuelOverviewSnapshot(tanks, todayCount, todayLitres, currentPrice, lastInternalReading);
    }
}
