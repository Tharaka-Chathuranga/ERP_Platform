package com.enlear.erp.fuel.controller;

import com.enlear.erp.fuel.controller.dto.FuelResponses.FuelOverviewResponse;
import com.enlear.erp.fuel.service.FuelOverviewService;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/** Aggregated fuel figures for the admin overview page. */
@RestController
@RequestMapping("/api/fuel/overview")
public class FuelOverviewController {

    private final FuelOverviewService overview;

    public FuelOverviewController(FuelOverviewService overview) {
        this.overview = overview;
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN','STORE_KEEPER')")
    public FuelOverviewResponse get() {
        return FuelOverviewResponse.from(overview.snapshot());
    }
}
