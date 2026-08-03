package com.enlear.erp.oilmart.controller;

import com.enlear.erp.oilmart.controller.dto.OilMartResponses.OilMartOverviewResponse;
import com.enlear.erp.oilmart.service.overview.OilMartOverviewPeriod;
import com.enlear.erp.oilmart.service.overview.OilMartOverviewService;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/oilmart/overview")
public class OilMartOverviewController {

    private final OilMartOverviewService overview;
    private final OilMartResponseAssembler assembler;

    public OilMartOverviewController(OilMartOverviewService overview,
                                     OilMartResponseAssembler assembler) {
        this.overview = overview;
        this.assembler = assembler;
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN','OIL_MART_SALES_ASSISTANT','OIL_MART_SALES_MANAGER')")
    public OilMartOverviewResponse snapshot(
            @RequestParam(defaultValue = "THIS_MONTH") OilMartOverviewPeriod period) {
        return OilMartOverviewResponse.from(overview.snapshot(period), assembler::toResponse);
    }
}
