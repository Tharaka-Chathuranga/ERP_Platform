package com.enlear.erp.store.service.command;

import java.math.BigDecimal;
import java.util.UUID;

/**
 * Intent to raise a count-adjustment request: bring {@code itemId}'s on-hand to
 * {@code requestedQuantity}, pending approval.
 */
public record CreateCountAdjustmentCommand(
        UUID itemId,
        BigDecimal requestedQuantity,
        String reason,
        UUID requestedByUserId) {
}
