package com.enlear.erp.oilmart.service;

import com.enlear.erp.oilmart.exposed.OilMartApi;
import com.enlear.erp.oilmart.exposed.dto.OilMartSalesSummary;
import com.enlear.erp.oilmart.exposed.dto.OilMartStockSummary;
import com.enlear.erp.oilmart.service.overview.OilMartOverviewPeriod;
import com.enlear.erp.oilmart.service.overview.OilMartOverviewService;
import com.enlear.erp.oilmart.service.overview.OilMartStockQueryService;
import java.util.List;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional(readOnly = true)
public class OilMartApiService implements OilMartApi {

    private final OilMartStockQueryService stockQueries;
    private final OilMartOverviewService overview;

    public OilMartApiService(OilMartStockQueryService stockQueries,
                             OilMartOverviewService overview) {
        this.stockQueries = stockQueries;
        this.overview = overview;
    }

    @Override
    public OilMartStockSummary stockSummary() {
        List<?> balances = stockQueries.balances();
        return new OilMartStockSummary(
                stockQueries.totalStockValue(),
                balances.size(),
                stockQueries.lowStock().size());
    }

    @Override
    public OilMartSalesSummary salesSummary() {
        var snapshot = overview.snapshot(OilMartOverviewPeriod.THIS_MONTH);
        return new OilMartSalesSummary(
                snapshot.salesThisPeriod(),
                snapshot.saleCountThisPeriod(),
                snapshot.awaitingApproval());
    }
}
