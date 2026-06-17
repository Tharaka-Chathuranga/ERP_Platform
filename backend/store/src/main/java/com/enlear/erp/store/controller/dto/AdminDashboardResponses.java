package com.enlear.erp.store.controller.dto;

import com.enlear.erp.store.model.DeviationStage;
import com.enlear.erp.store.model.DeviationStatus;
import com.enlear.erp.store.model.Item;
import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

/** Read-only aggregations powering the admin dashboard. */
public final class AdminDashboardResponses {

    private AdminDashboardResponses() {
    }

    /** Headline counts and totals for the admin overview cards. */
    public record DashboardSummaryResponse(
            long activeItemCount,
            long inactiveItemCount,
            long supplierCount,
            BigDecimal totalInventoryValue,
            long lowStockItemCount,
            long pendingIssueApprovalCount,
            long pendingDeviationCount,
            long pendingBorrowRequestCount,
            long pendingCountAdjustmentCount,
            long receivalCount) {
    }

    /** An active item whose on-hand has fallen below its reorder level. */
    public record LowStockItemResponse(
            UUID itemId, String itemCode, String name, String unitOfMeasure,
            BigDecimal quantityOnHand, BigDecimal reorderLevel, boolean criticalItem) {

        public static LowStockItemResponse from(Item i) {
            return new LowStockItemResponse(i.getId(), i.getItemCode(), i.getName(),
                    i.getUnitOfMeasure(), i.getQuantityOnHand(), i.getReorderLevel(), i.isCriticalItem());
        }
    }

    /** Received vs issued totals for a single day. */
    public record MovementTrendPointResponse(Instant day, BigDecimal received, BigDecimal issued) {
    }

    /** A single defective item line flattened out of its deviation request. */
    public record DeviationItemRowResponse(
            UUID requestId, UUID itemId, BigDecimal quantity, DeviationStatus status,
            DeviationStage stage, String reason, Instant requestedAt) {
    }
}
