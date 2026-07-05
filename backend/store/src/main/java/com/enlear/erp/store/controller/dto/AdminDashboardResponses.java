package com.enlear.erp.store.controller.dto;

import com.enlear.erp.store.model.DeviationStage;
import com.enlear.erp.store.model.DeviationStatus;
import com.enlear.erp.store.model.IssueStatus;
import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;
import java.util.UUID;

public final class AdminDashboardResponses {

    private AdminDashboardResponses() {
    }

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

    public record MovementTrendPointResponse(Instant day, BigDecimal received, BigDecimal issued) {
    }

    public record DeviationItemRowResponse(
            UUID requestId, UUID itemId, BigDecimal quantity, DeviationStatus status,
            DeviationStage stage, String reason, Instant requestedAt) {
    }

    public record TodayReceivalRowResponse(
            UUID receivalId, String receivalNumber, String supplierName,
            int lineCount, BigDecimal totalQuantity, BigDecimal totalValue, Instant receivedAt) {
    }

    public record TodayIssueRowResponse(
            UUID issueId, String issueNumber, UUID borrowingUserId,
            int lineCount, BigDecimal totalQuantity, BigDecimal totalValue, Instant issuedAt,
            IssueStatus status, long itemTypeCount, List<TodayIssueLineResponse> lines) {
    }

    public record TodayIssueLineResponse(String itemName, BigDecimal quantity) {
    }

    public record ItemStockRowResponse(
            UUID itemId, String itemCode, String name, String unitOfMeasure,
            BigDecimal quantityOnHand, BigDecimal reorderLevel, BigDecimal unitPrice,
            boolean criticalItem) {
    }

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
