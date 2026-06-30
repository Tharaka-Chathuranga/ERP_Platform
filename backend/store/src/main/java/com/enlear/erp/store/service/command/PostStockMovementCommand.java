package com.enlear.erp.store.service.command;

import com.enlear.erp.store.model.Location;
import com.enlear.erp.store.model.MovementType;
import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

/**
 * Intent to post a single stock movement (receipt, issue or adjustment).
 * {@code quantity} is a positive magnitude; the {@link MovementType} decides
 * its direction. {@code location} is the storage slot affected, or {@code null}
 * for movements that are not slot-tracked (manual adjustments, returns).
 */
public record PostStockMovementCommand(
        UUID itemId,
        MovementType type,
        BigDecimal quantity,
        BigDecimal unitCost,
        String reference,
        Instant occurredAt,
        Location location) {

    /** Convenience overload for movements with no specific storage slot. */
    public PostStockMovementCommand(UUID itemId, MovementType type, BigDecimal quantity,
                                    BigDecimal unitCost, String reference, Instant occurredAt) {
        this(itemId, type, quantity, unitCost, reference, occurredAt, null);
    }
}
