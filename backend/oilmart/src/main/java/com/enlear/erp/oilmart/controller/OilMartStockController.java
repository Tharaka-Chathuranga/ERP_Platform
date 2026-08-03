package com.enlear.erp.oilmart.controller;

import com.enlear.erp.oilmart.controller.dto.OilMartResponses.OilMartStockBalanceResponse;
import com.enlear.erp.oilmart.controller.dto.OilMartResponses.OilMartStockMovementResponse;
import com.enlear.erp.oilmart.service.overview.OilMartStockQueryService;
import com.enlear.erp.oilmart.service.stock.OilMartStockService;
import java.util.List;
import java.util.UUID;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/oilmart/stock")
public class OilMartStockController {

    private final OilMartStockQueryService stockQueries;
    private final OilMartStockService stock;

    public OilMartStockController(OilMartStockQueryService stockQueries, OilMartStockService stock) {
        this.stockQueries = stockQueries;
        this.stock = stock;
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN','OIL_MART_SALES_ASSISTANT','OIL_MART_SALES_MANAGER')")
    public List<OilMartStockBalanceResponse> balances() {
        return stockQueries.balances().stream().map(OilMartStockBalanceResponse::from).toList();
    }

    @GetMapping("/low")
    @PreAuthorize("hasAnyRole('ADMIN','OIL_MART_SALES_ASSISTANT','OIL_MART_SALES_MANAGER')")
    public List<OilMartStockBalanceResponse> lowStock() {
        return stockQueries.lowStock().stream().map(OilMartStockBalanceResponse::from).toList();
    }

    @GetMapping("/{itemId}/movements")
    @PreAuthorize("hasAnyRole('ADMIN','OIL_MART_SALES_ASSISTANT','OIL_MART_SALES_MANAGER')")
    public List<OilMartStockMovementResponse> movements(@PathVariable UUID itemId) {
        return stock.movements(itemId).stream().map(OilMartStockMovementResponse::from).toList();
    }
}
