package com.enlear.erp.store.controller.dto;

import com.enlear.erp.store.model.DeviationStage;
import com.enlear.erp.store.model.DeviationStatus;
import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;
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
            long lowStockCriticalItemCount,
            long lowStockNormalItemCount,
            long pendingIssueApprovalCount,
            long pendingDeviationCount,
            long pendingBorrowRequestCount,
            long pendingCountAdjustmentCount,
            long receivalCount,
            long issuedCount) {
    }

    /** Received vs issued totals for a single day. */
    public record MovementTrendPointResponse(Instant day, BigDecimal received, BigDecimal issued) {
    }

    /** A single defective item line flattened out of its deviation request. */
    public record DeviationItemRowResponse(
            UUID requestId, UUID itemId, BigDecimal quantity, DeviationStatus status,
            DeviationStage stage, String reason, Instant requestedAt) {
    }

    /**
     * A receival document recorded today. {@code totalValue} is the sum of each
     * line's quantity times its receipt unit cost.
     */
    public record TodayReceivalRowResponse(
            UUID receivalId, String receivalNumber, String supplierName,
            int lineCount, BigDecimal totalQuantity, BigDecimal totalValue, Instant receivedAt) {
    }

    /**
     * An issue document physically issued today. {@code totalValue} is the sum of
     * each line's quantity times the item's current unit price (issue lines carry
     * no cost of their own).
     */
    public record TodayIssueRowResponse(
            UUID issueId, String issueNumber, UUID borrowingUserId,
            int lineCount, BigDecimal totalQuantity, BigDecimal totalValue, Instant issuedAt) {
    }

    /** A single item row used across the stock-health lists. */
    public record ItemStockRowResponse(
            UUID itemId, String itemCode, String name, String unitOfMeasure,
            BigDecimal quantityOnHand, BigDecimal reorderLevel, BigDecimal unitPrice,
            boolean criticalItem) {
    }

    /**
     * Stock-health snapshot for the admin overview: items grouped into critical,
     * normal (healthy), warning (below reorder but not flagged critical) and
     * critical-warning (flagged critical and below reorder) buckets, each with its
     * full count. Warning and critical-warning partition the below-reorder items.
     */
    public record StockHealthResponse(
            List<ItemStockRowResponse> criticalItems,
            List<ItemStockRowResponse> normalItems,
            List<ItemStockRowResponse> warningItems,
            List<ItemStockRowResponse> criticalWarningItems,
            long criticalCount,
            long normalCount,
            long warningCount,
            long criticalWarningCount) {
    }
}
