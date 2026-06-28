package com.enlear.erp.fuel.service.command;

import java.math.BigDecimal;
import java.util.UUID;

/** Intent to record a timed level reading for a tank. */
public record RecordReadingCommand(UUID tankId, BigDecimal litresMeasured, UUID recordedByUserId, String note) {
}
