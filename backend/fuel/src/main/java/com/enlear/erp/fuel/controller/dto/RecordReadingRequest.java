package com.enlear.erp.fuel.controller.dto;

import com.enlear.erp.fuel.service.command.RecordReadingCommand;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.math.BigDecimal;
import java.util.UUID;

public record RecordReadingRequest(
        @NotNull @DecimalMin("0.0") BigDecimal litresMeasured,
        @NotNull UUID recordedByUserId,
        @Size(max = 1000) String note) {

    public RecordReadingCommand toCommand(UUID tankId) {
        return new RecordReadingCommand(tankId, litresMeasured, recordedByUserId, note);
    }
}
