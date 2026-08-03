package com.enlear.erp.oilmart.service.overview;

import com.enlear.erp.oilmart.model.OilMartQuotation;
import java.math.BigDecimal;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.List;

public record OilMartOverviewSnapshot(
        OilMartOverviewPeriod period,
        ChronoUnit trendBucket,
        BigDecimal stockValue,
        BigDecimal salesThisPeriod,
        long saleCountThisPeriod,
        long awaitingApproval,
        long lowStockCount,
        List<TrendPoint> salesTrend,
        List<OilMartStockView> lowStock,
        List<OilMartQuotation> pendingApprovals) {

    /** {@code bucketStart} is the instant the bucket opens; the UI decides how to label it. */
    public record TrendPoint(Instant bucketStart, BigDecimal total) {
    }
}
