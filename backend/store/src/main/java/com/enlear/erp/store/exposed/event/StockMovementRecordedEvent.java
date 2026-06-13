package com.enlear.erp.store.exposed.event;

import com.enlear.erp.store.model.MovementType;
import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

/**
 * Published after a stock movement is committed. Other modules (e.g. accounting
 * for inventory valuation, or notifications for low-stock alerts) can subscribe
 * without the store module knowing they exist — keeping modules decoupled.
 */
public record StockMovementRecordedEvent(
        UUID movementId,
        UUID itemId,
        MovementType type,
        BigDecimal quantity,
        BigDecimal newQuantityOnHand,
        Instant occurredAt) {
}
