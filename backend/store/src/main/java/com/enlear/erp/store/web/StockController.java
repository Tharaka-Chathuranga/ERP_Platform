package com.enlear.erp.store.web;

import com.enlear.erp.shared.web.PageResponse;
import com.enlear.erp.store.web.dto.PostMovementRequest;
import com.enlear.erp.store.web.dto.StoreResponses.StockLevelResponse;
import com.enlear.erp.store.web.dto.StoreResponses.StockMovementResponse;
import com.enlear.erp.store.service.StockService;
import jakarta.validation.Valid;
import java.util.List;
import java.util.UUID;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/store")
public class StockController {

    private final StockService stock;

    public StockController(StockService stock) {
        this.stock = stock;
    }

    /** Post a stock movement (receipt / issue / adjustment / transfer). */
    @PostMapping("/stock/movements")
    @ResponseStatus(HttpStatus.CREATED)
    @PreAuthorize("hasAnyRole('ADMIN','STORE_MANAGER','STORE_CLERK')")
    public StockMovementResponse post(@Valid @RequestBody PostMovementRequest request) {
        return StockMovementResponse.from(stock.postMovement(request.toCommand()));
    }

    /** Current on-hand quantities for an item across all warehouses. */
    @GetMapping("/items/{itemId}/stock-levels")
    @PreAuthorize("hasAnyRole('ADMIN','STORE_MANAGER','STORE_CLERK')")
    public List<StockLevelResponse> levels(@PathVariable UUID itemId) {
        return stock.getStockLevelsForItem(itemId).stream()
                .map(StockLevelResponse::from).toList();
    }

    /** Movement history (ledger) for an item, newest first. */
    @GetMapping("/items/{itemId}/movements")
    @PreAuthorize("hasAnyRole('ADMIN','STORE_MANAGER','STORE_CLERK')")
    public PageResponse<StockMovementResponse> movements(
            @PathVariable UUID itemId,
            @PageableDefault(size = 20) Pageable pageable) {
        return PageResponse.of(stock.getMovementsForItem(itemId, pageable),
                StockMovementResponse::from);
    }
}
