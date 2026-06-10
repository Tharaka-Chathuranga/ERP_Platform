package com.enlear.erp.store.service.command;

import com.enlear.erp.store.domain.MovementType;
import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

/**
 * Intent to post a single stock movement (receipt, issue or adjustment).
 * {@code quantity} is a positive magnitude; the {@link MovementType} decides
 * its direction.
 */
public record PostStockMovementCommand(
        UUID itemId,
        MovementType type,
        BigDecimal quantity,
        BigDecimal unitCost,
        String reference,
        Instant occurredAt) {
}
