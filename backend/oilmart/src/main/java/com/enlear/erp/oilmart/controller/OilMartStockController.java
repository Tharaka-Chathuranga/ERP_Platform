package com.enlear.erp.oilmart.controller;

import com.enlear.erp.oilmart.controller.dto.OilMartRequests.AdjustOilMartStockRequest;
import com.enlear.erp.oilmart.controller.dto.OilMartResponses.OilMartStockBalanceResponse;
import com.enlear.erp.oilmart.controller.dto.OilMartResponses.OilMartStockMovementResponse;
import com.enlear.erp.oilmart.service.overview.OilMartStockQueryService;
import com.enlear.erp.oilmart.service.stock.OilMartStockAdjustmentService;
import com.enlear.erp.oilmart.service.stock.OilMartStockService;
import jakarta.validation.Valid;
import java.util.List;
import java.util.UUID;
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
@RequestMapping("/api/oilmart/stock")
public class OilMartStockController {

    private final OilMartStockQueryService stockQueries;
    private final OilMartStockService stock;
    private final OilMartStockAdjustmentService adjustments;

    public OilMartStockController(OilMartStockQueryService stockQueries, OilMartStockService stock,
                                  OilMartStockAdjustmentService adjustments) {
        this.stockQueries = stockQueries;
        this.stock = stock;
        this.adjustments = adjustments;
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

    @PostMapping("/adjustments")
    @ResponseStatus(HttpStatus.CREATED)
    @PreAuthorize("hasAnyRole('ADMIN','OIL_MART_SALES_ASSISTANT','OIL_MART_SALES_MANAGER')")
    public OilMartStockMovementResponse adjust(@Valid @RequestBody AdjustOilMartStockRequest request) {
        return OilMartStockMovementResponse.from(adjustments.adjust(request.toCommand()));
    }
}
