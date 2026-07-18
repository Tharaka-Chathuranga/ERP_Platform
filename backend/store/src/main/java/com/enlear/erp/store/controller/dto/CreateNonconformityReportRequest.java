package com.enlear.erp.store.controller.dto;

import com.enlear.erp.store.model.DetectionStage;
import com.enlear.erp.store.service.command.CreateNonconformityReportCommand;
import jakarta.validation.Valid;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

public record CreateNonconformityReportRequest(
        @Size(max = 1000) String description,
        @NotNull UUID reportedByUserId,
        DetectionStage detectionStage,
        @NotNull @Size(min = 1) @Valid List<Line> items) {

    public record Line(
            @NotNull UUID itemId,
            @DecimalMin("0.0") BigDecimal quantity) {
    }

    public CreateNonconformityReportCommand toCommand() {
        return new CreateNonconformityReportCommand(description, reportedByUserId, detectionStage,
                items.stream()
                        .map(l -> new CreateNonconformityReportCommand.Line(l.itemId(), l.quantity()))
                        .toList());
    }
}
