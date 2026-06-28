package com.enlear.erp.fuel.controller.dto;

import com.enlear.erp.fuel.service.command.CreateFuelPriceCommand;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

public record CreateFuelPriceRequest(
        @NotNull @DecimalMin("0.0") BigDecimal unitPrice,
        @NotNull LocalDate effectiveFrom,
        @NotNull LocalDate effectiveTo,
        @NotNull UUID recordedByUserId,
        @Size(max = 1000) String note) {

    public CreateFuelPriceCommand toCommand() {
        return new CreateFuelPriceCommand(unitPrice, effectiveFrom, effectiveTo, recordedByUserId, note);
    }
}
