package com.enlear.erp.store.controller;

import com.enlear.erp.shared.web.PageResponse;
import com.enlear.erp.store.controller.dto.StoreResponses.ItemMovementSummaryResponse;
import com.enlear.erp.store.controller.dto.StoreResponses.StockMovementResponse;
import com.enlear.erp.store.service.movement.MovementService;
import java.util.List;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/store/movements")
public class MovementController {

    private final MovementService movements;

    public MovementController(MovementService movements) {
        this.movements = movements;
    }

    /** All movements across every item, newest first. */
    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN','STORE_KEEPER')")
    public PageResponse<StockMovementResponse> list(@PageableDefault(size = 20) Pageable pageable) {
        return PageResponse.of(movements.list(pageable), StockMovementResponse::from);
    }

    /** Received vs issued totals per item over the last {@code days} days, busiest first. */
    @GetMapping("/summary")
    @PreAuthorize("hasAnyRole('ADMIN','STORE_KEEPER')")
    public List<ItemMovementSummaryResponse> summary(
            @RequestParam(defaultValue = "12") int limit,
            @RequestParam(defaultValue = "30") int days) {
        return movements.summaryByItem(limit, days);
    }
}
