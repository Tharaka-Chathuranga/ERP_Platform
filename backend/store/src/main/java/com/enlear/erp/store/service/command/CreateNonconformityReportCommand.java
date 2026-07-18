package com.enlear.erp.store.service.command;

import com.enlear.erp.store.model.DetectionStage;
import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

public record CreateNonconformityReportCommand(
        String description,
        UUID reportedByUserId,
        DetectionStage detectionStage,
        List<Line> items) {

    public record Line(UUID itemId, BigDecimal quantity) {
    }
}
