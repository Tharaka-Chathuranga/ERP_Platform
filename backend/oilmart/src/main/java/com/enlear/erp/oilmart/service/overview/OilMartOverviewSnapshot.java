package com.enlear.erp.oilmart.service.overview;

import com.enlear.erp.oilmart.model.OilMartPaymentMethod;
import com.enlear.erp.oilmart.model.OilMartSale;
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
        List<RevenueByMethod> revenueByMethod,
        List<OilMartStockView> lowStock,
        List<OilMartSale> pendingApprovals) {

    public record TrendPoint(LocalDate date, BigDecimal total) {
    }

    public record RevenueByMethod(OilMartPaymentMethod paymentMethod, BigDecimal total) {
    }
}
