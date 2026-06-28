package com.enlear.erp.fuel.service;

import com.enlear.erp.fuel.model.FuelTank;
import com.enlear.erp.fuel.model.FuelTankPurpose;
import com.enlear.erp.fuel.model.Vehicle;
import com.enlear.erp.fuel.model.VehicleFuelIssue;
import com.enlear.erp.fuel.repository.VehicleFuelIssueRepository;
import com.enlear.erp.fuel.service.VehicleEfficiencySnapshot.EfficiencyPoint;
import com.enlear.erp.fuel.service.command.CreateVehicleFuelIssueCommand;
import com.enlear.erp.shared.error.BusinessRuleException;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneId;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Records vehicle fuel issues from the vehicle tank. The issued amount defaults
 * to filling the vehicle's tank ({@code capacity - currentReading}) and may not
 * overfill it. The issue draws down the vehicle tank's running level.
 */
@Service
@Transactional
public class VehicleFuelIssueService {

    private final VehicleFuelIssueRepository issues;
    private final VehicleService vehicleService;
    private final FuelTankService tankService;

    public VehicleFuelIssueService(VehicleFuelIssueRepository issues, VehicleService vehicleService,
                                   FuelTankService tankService) {
        this.issues = issues;
        this.vehicleService = vehicleService;
        this.tankService = tankService;
    }

    public VehicleFuelIssue createIssue(CreateVehicleFuelIssueCommand cmd) {
        Vehicle vehicle = vehicleService.getVehicle(cmd.vehicleId());
        if (!vehicle.isActive()) {
            throw new BusinessRuleException("FUEL_VEHICLE_INACTIVE",
                    "Cannot issue fuel to inactive vehicle " + vehicle.getVehicleNumber());
        }

        BigDecimal capacity = vehicle.getFullTankCapacityLitres();
        BigDecimal reading = cmd.vehicleReadingBeforeIssueLitres();
        // Null litres means "fill the tank fully".
        BigDecimal litres = cmd.litresIssued() != null
                ? cmd.litresIssued()
                : capacity.subtract(reading != null ? reading : BigDecimal.ZERO);

        VehicleFuelIssue.validateFill(capacity, reading, litres);

        // Draw the fuel from the vehicle tank (write-locked for serial updates).
        FuelTank vehicleTank = tankService.lockTankByPurpose(FuelTankPurpose.VEHICLE);
        vehicleTank.adjustLevel(litres.negate());
        tankService.save(vehicleTank);

        VehicleFuelIssue issue = new VehicleFuelIssue(vehicle.getId(), reading, litres,
                cmd.issuingUserId(), cmd.receivingUserId(), Instant.now(), cmd.odometerReadingKm());
        return issues.save(issue);
    }

    @Transactional(readOnly = true)
    public VehicleFuelIssue getIssue(UUID id) {
        return issues.findById(id)
                .orElseThrow(() -> new com.enlear.erp.shared.error.ResourceNotFoundException(
                        "VehicleFuelIssue", id));
    }

    @Transactional(readOnly = true)
    public Page<VehicleFuelIssue> list(LocalDate date, UUID vehicleId, Pageable pageable) {
        if (date != null) {
            Instant from = date.atStartOfDay(ZoneId.systemDefault()).toInstant();
            Instant to = date.plusDays(1).atStartOfDay(ZoneId.systemDefault()).toInstant();
            return vehicleId != null
                    ? issues.findByVehicleIdAndIssuedAtBetweenOrderByIssuedAtDesc(vehicleId, from, to, pageable)
                    : issues.findByIssuedAtBetweenOrderByIssuedAtDesc(from, to, pageable);
        }
        return vehicleId != null
                ? issues.findByVehicleIdOrderByIssuedAtDesc(vehicleId, pageable)
                : issues.findAllByOrderByIssuedAtDesc(pageable);
    }

    /**
     * Computes km/L efficiency for each vehicle over [from, to].
     *
     * <p>For each consecutive pair of odometer-carrying issues per vehicle:
     * <pre>
     *   litresConsumed = prev.reading + prev.litresIssued − curr.reading
     *   kmDriven       = curr.odometer − prev.odometer
     *   kmPerLitre     = kmDriven / litresConsumed
     * </pre>
     * The point is attributed to the date of the second fill (curr). A lookback
     * query supplies the anchor issue that precedes the range, so the first fill
     * in range always has a valid predecessor.
     */
    @Transactional(readOnly = true)
    public List<VehicleEfficiencySnapshot> getEfficiencyReport(LocalDate from, LocalDate to, UUID vehicleId) {
        ZoneId zone = ZoneId.systemDefault();
        Instant fromInstant = from.atStartOfDay(zone).toInstant();
        Instant toInstant = to.plusDays(1).atStartOfDay(zone).toInstant();

        // All odometer-carrying issues in range, grouped by vehicle (sorted asc)
        Map<UUID, List<VehicleFuelIssue>> byVehicle = issues
                .findByOdometerReadingKmNotNullAndIssuedAtBetweenOrderByVehicleIdAscIssuedAtAsc(fromInstant, toInstant)
                .stream()
                .filter(i -> vehicleId == null || i.getVehicleId().equals(vehicleId))
                .collect(Collectors.groupingBy(VehicleFuelIssue::getVehicleId, LinkedHashMap::new, Collectors.toList()));

        List<VehicleEfficiencySnapshot> result = new ArrayList<>();

        for (Map.Entry<UUID, List<VehicleFuelIssue>> entry : byVehicle.entrySet()) {
            UUID vid = entry.getKey();
            List<VehicleFuelIssue> inRange = entry.getValue();

            // Prepend the most recent prior issue so the first in-range fill has an anchor
            List<VehicleFuelIssue> ordered = new ArrayList<>();
            issues.findTopByVehicleIdAndOdometerReadingKmNotNullAndIssuedAtBeforeOrderByIssuedAtDesc(vid, fromInstant)
                    .ifPresent(ordered::add);
            ordered.addAll(inRange);

            List<EfficiencyPoint> points = new ArrayList<>();
            for (int i = 1; i < ordered.size(); i++) {
                VehicleFuelIssue prev = ordered.get(i - 1);
                VehicleFuelIssue curr = ordered.get(i);

                BigDecimal litresConsumed = prev.getVehicleReadingBeforeIssueLitres()
                        .add(prev.getLitresIssued())
                        .subtract(curr.getVehicleReadingBeforeIssueLitres());
                BigDecimal kmDriven = curr.getOdometerReadingKm()
                        .subtract(prev.getOdometerReadingKm());

                // Skip if data is inconsistent (odometer went backwards, or tank gain > loss)
                if (litresConsumed.signum() <= 0 || kmDriven.signum() <= 0) continue;

                BigDecimal kmPerLitre = kmDriven.divide(litresConsumed, 4, RoundingMode.HALF_UP);
                LocalDate date = curr.getIssuedAt().atZone(zone).toLocalDate();
                points.add(new EfficiencyPoint(date, kmPerLitre, kmDriven, litresConsumed));
            }

            if (!points.isEmpty()) {
                Vehicle vehicle = vehicleService.getVehicle(vid);
                result.add(new VehicleEfficiencySnapshot(vid, vehicle.getVehicleNumber(),
                        vehicle.getDriverUserId(), points));
            }
        }

        return result;
    }
}
