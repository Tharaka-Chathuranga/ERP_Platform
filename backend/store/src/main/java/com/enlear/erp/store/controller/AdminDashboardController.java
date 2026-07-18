package com.enlear.erp.store.controller;

import com.enlear.erp.store.controller.dto.AdminDashboardResponses.DashboardSummaryResponse;
import com.enlear.erp.store.controller.dto.AdminDashboardResponses.MovementTrendPointResponse;
import com.enlear.erp.store.controller.dto.AdminDashboardResponses.NonconformityItemRowResponse;
import com.enlear.erp.store.controller.dto.AdminDashboardResponses.StockHealthResponse;
import com.enlear.erp.store.controller.dto.AdminDashboardResponses.TodayIssueRowResponse;
import com.enlear.erp.store.controller.dto.AdminDashboardResponses.TodayReceivalRowResponse;
import com.enlear.erp.store.model.DetectionStage;
import com.enlear.erp.store.service.AdminDashboardQueryService;
import java.util.List;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

/**
 * Admin-only read endpoints aggregating store data for the admin dashboard.
 * Strictly read-side; the write workflows live in their own controllers.
 */
@RestController
@RequestMapping("/api/store/dashboard")
@PreAuthorize("hasRole('ADMIN')")
public class AdminDashboardController {

    private final AdminDashboardQueryService dashboard;

    public AdminDashboardController(AdminDashboardQueryService dashboard) {
        this.dashboard = dashboard;
    }

    @GetMapping("/summary")
    public DashboardSummaryResponse summary() {
        return dashboard.summary();
    }

    @GetMapping("/movement-trend")
    public List<MovementTrendPointResponse> movementTrend(@RequestParam(defaultValue = "30") int days) {
        return dashboard.movementTrend(days);
    }

    @GetMapping("/nonconformity-items")
    public List<NonconformityItemRowResponse> nonconformityItems(
            @RequestParam(required = false) DetectionStage detectionStage) {
        return dashboard.nonconformityItems(detectionStage);
    }

    @GetMapping("/today-receivals")
    public List<TodayReceivalRowResponse> todayReceivals() {
        return dashboard.todayReceivals();
    }

    @GetMapping("/today-issues")
    public List<TodayIssueRowResponse> todayIssues() {
        return dashboard.todayIssues();
    }

    @GetMapping("/stock-health")
    public StockHealthResponse stockHealth() {
        return dashboard.stockHealth();
    }
}
