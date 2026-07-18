package com.enlear.erp.fuel.controller.dto;

import com.enlear.erp.fuel.service.command.RecordFuelDeliveryCommand;
import jakarta.validation.Valid;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;
import jakarta.validation.constraints.Size;
import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

/** Inbound payload for recording a supplier fuel delivery. */
public record RecordFuelDeliveryRequest(
        @Size(max = 200) String supplierName,
        @NotNull @DecimalMin(value = "0.0", inclusive = false) BigDecimal orderedLitres,
        @NotNull LocalDate deliveredOn,
        Instant dischargeStartedAt,
        Instant dischargeFinishedAt,
        @NotNull UUID recordedByUserId,
        @Size(max = 1000) String note,
        @NotEmpty @Valid List<LineRequest> lines) {

    public record LineRequest(
            @NotNull UUID tankId,
            @NotNull @DecimalMin(value = "0.0", inclusive = false) BigDecimal litresDelivered,
            @PositiveOrZero BigDecimal dipBeforeLitres,
            @PositiveOrZero BigDecimal dipAfterLitres) {

        RecordFuelDeliveryCommand.Line toCommandLine() {
            return new RecordFuelDeliveryCommand.Line(tankId, litresDelivered, dipBeforeLitres, dipAfterLitres);
        }
    }

    public RecordFuelDeliveryCommand toCommand() {
        return new RecordFuelDeliveryCommand(supplierName, orderedLitres, deliveredOn,
                dischargeStartedAt, dischargeFinishedAt, recordedByUserId, note,
                lines.stream().map(LineRequest::toCommandLine).toList());
    }
}
