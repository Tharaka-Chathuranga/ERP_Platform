package com.enlear.erp.fuel.controller.dto;

import com.enlear.erp.fuel.service.command.CreateVehicleFuelIssueCommand;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;
import java.util.UUID;

/**
 * Issue fuel to a vehicle. {@code litresIssued} may be omitted to fill the tank
 * fully (capacity minus the current vehicle reading).
 */
public record CreateVehicleFuelIssueRequest(
        @NotNull UUID vehicleId,
        @NotNull @DecimalMin("0.0") BigDecimal vehicleReadingBeforeIssueLitres,
        @DecimalMin(value = "0.0", inclusive = false) BigDecimal litresIssued,
        @NotNull UUID issuingUserId,
        @NotNull UUID receivingUserId,
        /** Current vehicle odometer in km. Optional but enables km/L reporting. */
        @DecimalMin("0.0") BigDecimal odometerReadingKm) {

    public CreateVehicleFuelIssueCommand toCommand() {
        return new CreateVehicleFuelIssueCommand(vehicleId, vehicleReadingBeforeIssueLitres,
                litresIssued, issuingUserId, receivingUserId, odometerReadingKm);
    }
}
