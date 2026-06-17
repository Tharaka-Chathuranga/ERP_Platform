package com.enlear.erp.store.service.movement;

import com.enlear.erp.store.controller.dto.StoreResponses.ItemMovementSummaryResponse;
import com.enlear.erp.store.model.MovementType;
import com.enlear.erp.store.model.StockMovement;
import com.enlear.erp.store.repository.StockMovementRepository;
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

    private final StockMovementRepository movements;

    public MovementService(StockMovementRepository movements) {
        this.movements = movements;
    }

    /** All movements across every item, newest first. */
    public Page<StockMovement> list(Pageable pageable) {
        return movements.findAllByOrderByOccurredAtDesc(pageable);
    }

    /**
     * Received vs issued totals per item, busiest items first — aggregated
     * across all receiving and issuing. The data behind the bar chart.
     */
    public List<ItemMovementSummaryResponse> summaryByItem(int limit) {
        int capped = Math.max(1, Math.min(limit, MAX_ITEMS));
        return movements
                .sumByItem(MovementType.RECEIPT, MovementType.ISSUE, PageRequest.of(0, capped))
                .stream()
                .map(t -> new ItemMovementSummaryResponse(
                        t.getItemId(), t.getReceived(), t.getIssued()))
                .toList();
    }
}
