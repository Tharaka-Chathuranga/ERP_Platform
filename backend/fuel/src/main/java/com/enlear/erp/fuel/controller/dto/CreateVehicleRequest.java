package com.enlear.erp.fuel.controller.dto;

import com.enlear.erp.fuel.service.command.CreateVehicleCommand;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.math.BigDecimal;
import java.util.UUID;

public record CreateVehicleRequest(
        @NotBlank @Size(max = 64) String vehicleNumber,
        @NotNull @DecimalMin(value = "0.0", inclusive = false) BigDecimal fullTankCapacityLitres,
        @Size(max = 1000) String description,
        UUID driverUserId) {

    public CreateVehicleCommand toCommand() {
        return new CreateVehicleCommand(vehicleNumber, fullTankCapacityLitres, description, driverUserId);
    }
}
