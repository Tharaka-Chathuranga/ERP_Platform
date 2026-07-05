package com.enlear.erp.store.service;

import com.enlear.erp.store.controller.dto.AdminDashboardResponses.DashboardSummaryResponse;
import com.enlear.erp.store.controller.dto.AdminDashboardResponses.DeviationItemRowResponse;
import com.enlear.erp.store.controller.dto.AdminDashboardResponses.ItemStockRowResponse;
import com.enlear.erp.store.controller.dto.AdminDashboardResponses.MovementTrendPointResponse;
import com.enlear.erp.store.controller.dto.AdminDashboardResponses.StockHealthResponse;
import com.enlear.erp.store.controller.dto.AdminDashboardResponses.TodayIssueRowResponse;
import com.enlear.erp.store.controller.dto.AdminDashboardResponses.TodayReceivalRowResponse;
import com.enlear.erp.store.model.BorrowRequestStatus;
import com.enlear.erp.store.model.CountAdjustmentStatus;
import com.enlear.erp.store.model.DeviationStage;
import com.enlear.erp.store.model.DeviationStatus;
import com.enlear.erp.store.model.Issue;
import com.enlear.erp.store.model.IssueLine;
import com.enlear.erp.store.model.IssueStatus;
import com.enlear.erp.store.model.Item;
import com.enlear.erp.store.model.ItemStatus;
import com.enlear.erp.store.model.Receival;
import com.enlear.erp.store.model.ReceivalItem;
import com.enlear.erp.store.repository.BorrowRequestRepository;
import com.enlear.erp.store.repository.DeviationRequestRepository;
import com.enlear.erp.store.repository.IssueRepository;
import com.enlear.erp.store.repository.ItemRepository;
import com.enlear.erp.store.repository.ReceivalRepository;
import com.enlear.erp.store.repository.StockCountAdjustmentRequestRepository;
import com.enlear.erp.store.repository.StockMovementRepository;
import com.enlear.erp.store.repository.SupplierRepository;
import java.math.BigDecimal;
import java.time.Duration;
import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneId;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.UUID;
import java.util.function.Function;
import java.util.stream.Collectors;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.PageRequest;
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

    /** Upper bound on rows returned for the (potentially large) normal-stock list. */
    private static final int MAX_NORMAL_ROWS = 50;

    private final ItemRepository items;
    private final SupplierRepository suppliers;
    private final IssueRepository issues;
    private final DeviationRequestRepository deviations;
    private final BorrowRequestRepository borrowRequests;
    private final StockCountAdjustmentRequestRepository countRequests;
    private final ReceivalRepository receivals;
    private final StockMovementRepository movements;

    /** Zone used to resolve "today" boundaries for the daily movement lists. */
    private final ZoneId zone;

    public AdminDashboardQueryService(ItemRepository items, SupplierRepository suppliers,
                                      IssueRepository issues, DeviationRequestRepository deviations,
                                      BorrowRequestRepository borrowRequests,
                                      StockCountAdjustmentRequestRepository countRequests,
                                      ReceivalRepository receivals, StockMovementRepository movements,
                                      @Value("${app.timezone:UTC}") String timezone) {
        this.items = items;
        this.suppliers = suppliers;
        this.issues = issues;
        this.deviations = deviations;
        this.borrowRequests = borrowRequests;
        this.countRequests = countRequests;
        this.receivals = receivals;
        this.movements = movements;
        this.zone = ZoneId.of(timezone);
    }

    public DashboardSummaryResponse summary() {
        long lowStock = items.countLowStock();
        long lowStockCritical = items.countCriticalLowStock();
        return new DashboardSummaryResponse(
                items.countByStatus(ItemStatus.ACTIVE),
                items.countByStatus(ItemStatus.INACTIVE),
                suppliers.count(),
                items.totalInventoryValue(),
                lowStock,
                lowStockCritical,
                lowStock - lowStockCritical,
                issues.countByStatus(IssueStatus.PENDING_APPROVAL),
                deviations.countByStatus(DeviationStatus.PENDING),
                borrowRequests.countByStatus(BorrowRequestStatus.PENDING),
                countRequests.countByStatus(CountAdjustmentStatus.PENDING),
                receivals.count(),
                issues.countByStatus(IssueStatus.ISSUED));
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

    /** Receival documents recorded today, newest first. */
    public List<TodayReceivalRowResponse> todayReceivals() {
        Instant start = startOfToday();
        Instant end = startOfTomorrow();
        return receivals.findByReceivedAtGreaterThanEqualAndReceivedAtLessThanOrderByReceivedAtDesc(start, end)
                .stream()
                .map(AdminDashboardQueryService::toReceivalRow)
                .toList();
    }

    /** Issue documents physically issued today, newest first. */
    public List<TodayIssueRowResponse> todayIssues() {
        Instant start = startOfToday();
        Instant end = startOfTomorrow();
        List<Issue> todays = issues.findByStatusAndIssuedAtGreaterThanEqualAndIssuedAtLessThanOrderByIssuedAtDesc(
                IssueStatus.ISSUED, start, end);
        Map<UUID, BigDecimal> priceByItemId = unitPricesFor(todays);
        return todays.stream()
                .map(i -> toIssueRow(i, priceByItemId))
                .toList();
    }

    /** Current unit price per item referenced by any line of the given issues. */
    private Map<UUID, BigDecimal> unitPricesFor(List<Issue> issuesToPrice) {
        Set<UUID> itemIds = issuesToPrice.stream()
                .flatMap(i -> i.getLines().stream())
                .map(IssueLine::getItemId)
                .collect(Collectors.toSet());
        if (itemIds.isEmpty()) {
            return Map.of();
        }
        return items.findAllById(itemIds).stream()
                .collect(Collectors.toMap(Item::getId, AdminDashboardQueryService::priceOf));
    }

    /** Critical / normal / warning / critical-warning stock buckets with their full counts. */
    public StockHealthResponse stockHealth() {
        var critical = items.findCriticalItems().stream()
                .map(AdminDashboardQueryService::toStockRow).toList();
        var warning = items.findNormalLowStock().stream()
                .map(AdminDashboardQueryService::toStockRow).toList();
        var criticalWarning = items.findCriticalLowStock().stream()
                .map(AdminDashboardQueryService::toStockRow).toList();
        var normal = items.findNormalStock(PageRequest.of(0, MAX_NORMAL_ROWS)).stream()
                .map(AdminDashboardQueryService::toStockRow).toList();
        return new StockHealthResponse(critical, normal, warning, criticalWarning,
                items.countCritical(), items.countNormalStock(),
                items.countNormalLowStock(), items.countCriticalLowStock());
    }

    private Instant startOfToday() {
        return LocalDate.now(zone).atStartOfDay(zone).toInstant();
    }

    private Instant startOfTomorrow() {
        return LocalDate.now(zone).plusDays(1).atStartOfDay(zone).toInstant();
    }

    private static TodayReceivalRowResponse toReceivalRow(Receival r) {
        BigDecimal value = r.getLines().stream()
                .map(l -> l.getQuantity().multiply(nullToZero(l.getUnitCost())))
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        return new TodayReceivalRowResponse(r.getId(), r.getReceivalNumber(), r.getSupplierName(),
                r.getLines().size(), sumQuantity(r.getLines(), ReceivalItem::getQuantity),
                value, r.getReceivedAt());
    }

    private static TodayIssueRowResponse toIssueRow(Issue i, Map<UUID, BigDecimal> priceByItemId) {
        BigDecimal value = i.getLines().stream()
                .map(l -> l.getQuantity().multiply(priceByItemId.getOrDefault(l.getItemId(), BigDecimal.ZERO)))
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        return new TodayIssueRowResponse(i.getId(), i.getIssueNumber(), i.getBorrowingUserId(),
                i.getLines().size(), sumQuantity(i.getLines(), IssueLine::getQuantity),
                value, i.getIssuedAt());
    }

    private static ItemStockRowResponse toStockRow(Item item) {
        return new ItemStockRowResponse(item.getId(), item.getItemCode(), item.getName(),
                item.getUnitOfMeasure(), item.getQuantityOnHand(), item.getReorderLevel(),
                priceOf(item), item.isCriticalItem());
    }

    private static BigDecimal priceOf(Item item) {
        return nullToZero(item.getUnitPrice());
    }

    private static BigDecimal nullToZero(BigDecimal value) {
        return value != null ? value : BigDecimal.ZERO;
    }

    private static <T> BigDecimal sumQuantity(List<T> lines, Function<T, BigDecimal> qty) {
        return lines.stream().map(qty).reduce(BigDecimal.ZERO, BigDecimal::add);
    }
}
