package com.enlear.erp.store.service;

import com.enlear.erp.store.controller.dto.AdminDashboardResponses.DashboardSummaryResponse;
import com.enlear.erp.store.controller.dto.AdminDashboardResponses.DeviationItemRowResponse;
import com.enlear.erp.store.controller.dto.AdminDashboardResponses.LowStockItemResponse;
import com.enlear.erp.store.controller.dto.AdminDashboardResponses.MovementTrendPointResponse;
import com.enlear.erp.store.model.BorrowRequestStatus;
import com.enlear.erp.store.model.CountAdjustmentStatus;
import com.enlear.erp.store.model.DeviationStage;
import com.enlear.erp.store.model.DeviationStatus;
import com.enlear.erp.store.model.IssueStatus;
import com.enlear.erp.store.model.ItemStatus;
import com.enlear.erp.store.repository.BorrowRequestRepository;
import com.enlear.erp.store.repository.DeviationRequestRepository;
import com.enlear.erp.store.repository.IssueRepository;
import com.enlear.erp.store.repository.ItemRepository;
import com.enlear.erp.store.repository.ReceivalRepository;
import com.enlear.erp.store.repository.StockCountAdjustmentRequestRepository;
import com.enlear.erp.store.repository.StockMovementRepository;
import com.enlear.erp.store.repository.SupplierRepository;
import java.time.Duration;
import java.time.Instant;
import java.util.List;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Read-only aggregation for the admin dashboard. Composes counts and totals from
 * the existing repositories without loading entities where a count/sum suffices,
 * keeping the dashboard cheap to render. Writes stay in their owning services.
 */
@Service
@Transactional(readOnly = true)
public class AdminDashboardQueryService {

    private static final int MAX_TREND_DAYS = 365;

    private final ItemRepository items;
    private final SupplierRepository suppliers;
    private final IssueRepository issues;
    private final DeviationRequestRepository deviations;
    private final BorrowRequestRepository borrowRequests;
    private final StockCountAdjustmentRequestRepository countRequests;
    private final ReceivalRepository receivals;
    private final StockMovementRepository movements;

    public AdminDashboardQueryService(ItemRepository items, SupplierRepository suppliers,
                                      IssueRepository issues, DeviationRequestRepository deviations,
                                      BorrowRequestRepository borrowRequests,
                                      StockCountAdjustmentRequestRepository countRequests,
                                      ReceivalRepository receivals, StockMovementRepository movements) {
        this.items = items;
        this.suppliers = suppliers;
        this.issues = issues;
        this.deviations = deviations;
        this.borrowRequests = borrowRequests;
        this.countRequests = countRequests;
        this.receivals = receivals;
        this.movements = movements;
    }

    public DashboardSummaryResponse summary() {
        return new DashboardSummaryResponse(
                items.countByStatus(ItemStatus.ACTIVE),
                items.countByStatus(ItemStatus.INACTIVE),
                suppliers.count(),
                items.totalInventoryValue(),
                items.countLowStock(),
                issues.countByStatus(IssueStatus.PENDING_APPROVAL),
                deviations.countByStatus(DeviationStatus.PENDING),
                borrowRequests.countByStatus(BorrowRequestStatus.PENDING),
                countRequests.countByStatus(CountAdjustmentStatus.PENDING),
                receivals.count());
    }

    public List<LowStockItemResponse> lowStockItems() {
        return items.findLowStock().stream().map(LowStockItemResponse::from).toList();
    }

    public List<MovementTrendPointResponse> movementTrend(int days) {
        int cappedDays = Math.max(1, Math.min(days, MAX_TREND_DAYS));
        Instant since = Instant.now().minus(Duration.ofDays(cappedDays));
        return movements.dailyTotalsSince(since).stream()
                .map(t -> new MovementTrendPointResponse(t.getDay(), t.getReceived(), t.getIssued()))
                .toList();
    }

    public List<DeviationItemRowResponse> deviationItems(DeviationStage stage) {
        var rows = stage == null
                ? deviations.findAllItemLines()
                : deviations.findItemLinesByStage(stage);
        return rows.stream()
                .map(r -> new DeviationItemRowResponse(r.getRequestId(), r.getItemId(), r.getQuantity(),
                        r.getStatus(), r.getStage(), r.getReason(), r.getRequestedAt()))
                .toList();
    }
}
