package com.enlear.erp.store.controller;

import com.enlear.erp.store.controller.dto.AdminDashboardResponses.DashboardSummaryResponse;
import com.enlear.erp.store.controller.dto.AdminDashboardResponses.DeviationItemRowResponse;
import com.enlear.erp.store.controller.dto.AdminDashboardResponses.MovementTrendPointResponse;
import com.enlear.erp.store.model.DeviationStage;
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

    @GetMapping("/defect-items")
    public List<DeviationItemRowResponse> defectItems(
            @RequestParam(required = false) DeviationStage stage) {
        return dashboard.deviationItems(stage);
    }
}
