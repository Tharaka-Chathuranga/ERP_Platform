package com.enlear.erp.fuel.service.command;

import java.math.BigDecimal;
import java.util.UUID;

/** Intent to record a delivery of fuel into a tank. */
public record RecordRefillCommand(UUID tankId, BigDecimal litres, UUID recordedByUserId, String note) {
}
