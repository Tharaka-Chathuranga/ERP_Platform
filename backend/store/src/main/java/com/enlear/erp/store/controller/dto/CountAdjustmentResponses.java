package com.enlear.erp.store.controller.dto;

import com.enlear.erp.store.model.CountAdjustmentStatus;
import com.enlear.erp.store.model.StockCountAdjustmentRequest;
import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

/** Outbound representations for the count-adjustment request workflow. */
public final class CountAdjustmentResponses {

    private CountAdjustmentResponses() {
    }

    public record CountAdjustmentResponse(
            UUID id, UUID itemId, BigDecimal currentQuantity, BigDecimal requestedQuantity,
            String reason, CountAdjustmentStatus status, UUID requestedByUserId, Instant requestedAt,
            UUID approvedByUserId, Instant approvedAt) {

        public static CountAdjustmentResponse from(StockCountAdjustmentRequest r) {
            return new CountAdjustmentResponse(r.getId(), r.getItemId(), r.getCurrentQuantity(),
                    r.getRequestedQuantity(), r.getReason(), r.getStatus(), r.getRequestedByUserId(),
                    r.getRequestedAt(), r.getApprovedByUserId(), r.getApprovedAt());
        }
    }
}
