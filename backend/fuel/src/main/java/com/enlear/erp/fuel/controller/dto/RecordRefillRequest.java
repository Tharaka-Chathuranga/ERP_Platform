package com.enlear.erp.fuel.controller.dto;

import com.enlear.erp.fuel.service.command.RecordRefillCommand;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.math.BigDecimal;
import java.util.UUID;

public record RecordRefillRequest(
        @NotNull @DecimalMin(value = "0.0", inclusive = false) BigDecimal litres,
        @NotNull UUID recordedByUserId,
        @Size(max = 1000) String note) {

    public RecordRefillCommand toCommand(UUID tankId) {
        return new RecordRefillCommand(tankId, litres, recordedByUserId, note);
    }
}
