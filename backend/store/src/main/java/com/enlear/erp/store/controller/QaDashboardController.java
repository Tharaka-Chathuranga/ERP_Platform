package com.enlear.erp.store.controller;

import com.enlear.erp.store.controller.dto.QaDashboardResponses.QaDefectSummaryResponse;
import com.enlear.erp.store.service.QaDashboardQueryService;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/store/qa/dashboard")
@PreAuthorize("hasAnyRole('ADMIN','QUALITY_ASSURANCE')")
public class QaDashboardController {

    private final QaDashboardQueryService dashboard;

    public QaDashboardController(QaDashboardQueryService dashboard) {
        this.dashboard = dashboard;
    }

    @GetMapping("/summary")
    public QaDefectSummaryResponse summary() {
        return dashboard.defectSummary();
    }
}
