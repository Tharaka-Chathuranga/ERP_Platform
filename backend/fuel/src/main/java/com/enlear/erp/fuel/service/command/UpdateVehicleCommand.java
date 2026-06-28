package com.enlear.erp.fuel.service.command;

import java.math.BigDecimal;
import java.util.UUID;

/** Intent to update a vehicle's editable fields. */
public record UpdateVehicleCommand(
        String vehicleNumber,
        String name,
        String category,
        BigDecimal fullTankCapacityLitres,
        String description,
        UUID driverUserId) {
}
