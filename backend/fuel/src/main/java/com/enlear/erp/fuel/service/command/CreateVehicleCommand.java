package com.enlear.erp.fuel.service.command;

import java.math.BigDecimal;
import java.util.UUID;

/** Intent to add a vehicle to the fuel master. */
public record CreateVehicleCommand(
        String vehicleNumber,
        BigDecimal fullTankCapacityLitres,
        String description,
        UUID driverUserId) {
}
