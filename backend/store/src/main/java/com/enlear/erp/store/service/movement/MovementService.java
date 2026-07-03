package com.enlear.erp.store.service.movement;

import com.enlear.erp.store.controller.dto.StoreResponses.ItemMovementSummaryResponse;
import com.enlear.erp.store.model.MovementType;
import com.enlear.erp.store.model.StockMovement;
import com.enlear.erp.store.repository.StockMovementRepository;
import java.time.Duration;
import java.time.Instant;
import java.util.List;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Read-side reporting over the stock-movement ledger: the full history and the
 * per-item received-vs-issued totals that feed the Stock Movements chart.
 * Writing the ledger stays in {@code StockService}; this service only queries.
 */
@Service
@Transactional(readOnly = true)
public class MovementService {

    private static final int MAX_ITEMS = 50;
    private static final int MAX_DAYS = 365;

    private final StockMovementRepository movements;

    public MovementService(StockMovementRepository movements) {
        this.movements = movements;
    }

    /** All movements across every item, newest first. */
    public Page<StockMovement> list(Pageable pageable) {
        return movements.findAllByOrderByOccurredAtDesc(pageable);
    }

    /**
     * Received vs issued totals per item, busiest items first — aggregated over
     * the last {@code days} days so it lines up with the movement-trend chart.
     */
    public List<ItemMovementSummaryResponse> summaryByItem(int limit, int days) {
        int cappedItems = Math.max(1, Math.min(limit, MAX_ITEMS));
        int cappedDays = Math.max(1, Math.min(days, MAX_DAYS));
        Instant since = Instant.now().minus(Duration.ofDays(cappedDays));
        return movements
                .sumByItem(MovementType.RECEIPT, MovementType.ISSUE, since, PageRequest.of(0, cappedItems))
                .stream()
                .map(t -> new ItemMovementSummaryResponse(
                        t.getItemId(), t.getReceived(), t.getIssued()))
                .toList();
    }
}
