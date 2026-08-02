package com.enlear.erp.oilmart.service.overview;

import com.enlear.erp.oilmart.model.OilMartQuotation;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

public record OilMartOverviewSnapshot(
        BigDecimal stockValue,
        BigDecimal salesThisPeriod,
        long saleCountThisPeriod,
        long awaitingApproval,
        long lowStockCount,
        List<TrendPoint> salesTrend,
        List<OilMartStockView> lowStock,
        List<OilMartQuotation> pendingApprovals) {

    public record TrendPoint(LocalDate date, BigDecimal total) {
    }
}
