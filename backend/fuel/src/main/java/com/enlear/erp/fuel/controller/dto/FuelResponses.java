package com.enlear.erp.fuel.controller.dto;

import com.enlear.erp.fuel.model.FuelPrice;
import com.enlear.erp.fuel.model.FuelTank;
import com.enlear.erp.fuel.model.FuelTankPurpose;
import com.enlear.erp.fuel.model.FuelTankReading;
import com.enlear.erp.fuel.model.FuelTankRefill;
import com.enlear.erp.fuel.model.TankStatus;
import com.enlear.erp.fuel.model.Vehicle;
import com.enlear.erp.fuel.model.VehicleFuelIssue;
import com.enlear.erp.fuel.model.VehicleStatus;
import com.enlear.erp.fuel.service.FuelOverviewSnapshot;
import com.enlear.erp.fuel.service.ReadingWithConsumption;
import com.enlear.erp.fuel.service.VehicleEfficiencySnapshot;
import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

/**
 * Outbound API representations and the mapping from domain models. Grouped in
 * one file to keep the read-side DTOs together; mapping is explicit so the API
 * contract is stable and obvious.
 */
public final class FuelResponses {

    private FuelResponses() {
    }

    public record TankResponse(
            UUID id, String name, FuelTankPurpose purpose, BigDecimal capacityLitres,
            BigDecimal currentLitres, TankStatus status) {

        public static TankResponse from(FuelTank t) {
            return new TankResponse(t.getId(), t.getName(), t.getPurpose(),
                    t.getCapacityLitres(), t.getCurrentLitres(), t.getStatus());
        }
    }

    public record RefillResponse(
            UUID id, UUID tankId, BigDecimal litres, Instant refilledAt,
            UUID recordedByUserId, String note) {

        public static RefillResponse from(FuelTankRefill r) {
            return new RefillResponse(r.getId(), r.getTankId(), r.getLitres(),
                    r.getRefilledAt(), r.getRecordedByUserId(), r.getNote());
        }
    }

    public record ReadingResponse(
            UUID id, UUID tankId, BigDecimal litresMeasured, Instant readingAt,
            UUID recordedByUserId, String note, BigDecimal consumptionSincePrevious) {

        public static ReadingResponse from(ReadingWithConsumption rc) {
            FuelTankReading r = rc.reading();
            return new ReadingResponse(r.getId(), r.getTankId(), r.getLitresMeasured(),
                    r.getReadingAt(), r.getRecordedByUserId(), r.getNote(),
                    rc.consumptionSincePrevious());
        }
    }

    public record VehicleResponse(
            UUID id, String vehicleNumber, String name, String category,
            BigDecimal fullTankCapacityLitres, String description, UUID driverUserId,
            VehicleStatus status) {

        public static VehicleResponse from(Vehicle v) {
            return new VehicleResponse(v.getId(), v.getVehicleNumber(), v.getName(), v.getCategory(),
                    v.getFullTankCapacityLitres(), v.getDescription(),
                    v.getDriverUserId(), v.getStatus());
        }
    }

    public record VehicleFuelIssueResponse(
            UUID id, UUID vehicleId, BigDecimal vehicleReadingBeforeIssueLitres,
            BigDecimal litresIssued, UUID issuingUserId, UUID receivingUserId, Instant issuedAt,
            BigDecimal odometerReadingKm) {

        public static VehicleFuelIssueResponse from(VehicleFuelIssue i) {
            return new VehicleFuelIssueResponse(i.getId(), i.getVehicleId(),
                    i.getVehicleReadingBeforeIssueLitres(), i.getLitresIssued(),
                    i.getIssuingUserId(), i.getReceivingUserId(), i.getIssuedAt(),
                    i.getOdometerReadingKm());
        }
    }

    public record FuelPriceResponse(
            UUID id, BigDecimal unitPrice, LocalDate effectiveFrom, LocalDate effectiveTo,
            UUID recordedByUserId, String note) {

        public static FuelPriceResponse from(FuelPrice p) {
            return new FuelPriceResponse(p.getId(), p.getUnitPrice(), p.getEffectiveFrom(),
                    p.getEffectiveTo(), p.getRecordedByUserId(), p.getNote());
        }
    }

    // ── Fuel efficiency report ─────────────────────────────────────

    public record EfficiencyPointResponse(
            LocalDate date, BigDecimal kmPerLitre, BigDecimal kmDriven, BigDecimal litresConsumed) {
    }

    public record VehicleEfficiencyResponse(
            UUID vehicleId, String vehicleNumber, UUID driverUserId,
            List<EfficiencyPointResponse> points) {

        public static VehicleEfficiencyResponse from(VehicleEfficiencySnapshot s) {
            List<EfficiencyPointResponse> pts = s.points().stream()
                    .map(p -> new EfficiencyPointResponse(p.date(), p.kmPerLitre(), p.kmDriven(), p.litresConsumed()))
                    .toList();
            return new VehicleEfficiencyResponse(s.vehicleId(), s.vehicleNumber(), s.driverUserId(), pts);
        }
    }

    // ── Admin overview ──────────────────────────────────────────────

    public record OverviewTank(
            FuelTankPurpose purpose, String name, BigDecimal currentLitres, BigDecimal capacityLitres) {
    }

    public record OverviewPrice(BigDecimal unitPrice, LocalDate effectiveFrom, LocalDate effectiveTo) {
    }

    public record OverviewReading(
            BigDecimal litresMeasured, Instant readingAt, BigDecimal consumptionSincePrevious) {
    }

    public record FuelOverviewResponse(
            List<OverviewTank> tanks, long todayIssueCount, BigDecimal todayLitres,
            OverviewPrice currentPrice, OverviewReading lastInternalReading) {

        public static FuelOverviewResponse from(FuelOverviewSnapshot s) {
            List<OverviewTank> tanks = s.tanks().stream()
                    .map(t -> new OverviewTank(t.getPurpose(), t.getName(),
                            t.getCurrentLitres(), t.getCapacityLitres()))
                    .toList();
            OverviewPrice price = s.currentPrice() == null ? null
                    : new OverviewPrice(s.currentPrice().getUnitPrice(),
                            s.currentPrice().getEffectiveFrom(), s.currentPrice().getEffectiveTo());
            OverviewReading reading = s.lastInternalReading() == null ? null
                    : new OverviewReading(s.lastInternalReading().reading().getLitresMeasured(),
                            s.lastInternalReading().reading().getReadingAt(),
                            s.lastInternalReading().consumptionSincePrevious());
            return new FuelOverviewResponse(tanks, s.todayIssueCount(), s.todayLitres(), price, reading);
        }
    }
}
