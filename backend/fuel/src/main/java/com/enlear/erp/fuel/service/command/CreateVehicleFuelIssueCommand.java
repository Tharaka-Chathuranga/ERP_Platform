package com.enlear.erp.fuel.service.command;

import java.math.BigDecimal;
import java.util.UUID;

/**
 * Intent to issue fuel to a vehicle. {@code litresIssued} may be null to mean
 * "fill the tank fully" (capacity minus the current vehicle reading).
 */
public record CreateVehicleFuelIssueCommand(
        UUID vehicleId,
        BigDecimal vehicleReadingBeforeIssueLitres,
        BigDecimal litresIssued,
        UUID issuingUserId,
        UUID receivingUserId,
        BigDecimal odometerReadingKm) {
}
