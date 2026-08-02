package com.enlear.erp.oilmart.service.overview;

import com.enlear.erp.oilmart.model.OilMartPaymentMethod;
import com.enlear.erp.oilmart.model.OilMartSale;
import com.enlear.erp.oilmart.model.OilMartSaleStatus;
import com.enlear.erp.oilmart.repository.OilMartSaleRepository;
import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneOffset;
import java.time.temporal.ChronoUnit;
import java.util.EnumMap;
import java.util.List;
import java.util.Map;
import java.util.TreeMap;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional(readOnly = true)
public class OilMartOverviewService {

    private static final int TREND_DAYS = 7;

    private final OilMartSaleRepository sales;
    private final OilMartStockQueryService stockQueries;

    public OilMartOverviewService(OilMartSaleRepository sales,
                                  OilMartStockQueryService stockQueries) {
        this.sales = sales;
        this.stockQueries = stockQueries;
    }

    public OilMartOverviewSnapshot snapshot() {
        LocalDate today = LocalDate.now();
        LocalDate from = today.minusDays(TREND_DAYS - 1L);
        Instant since = from.atStartOfDay(ZoneOffset.UTC).toInstant();

        List<OilMartSale> invoiced = sales.findInvoicedSince(OilMartSaleStatus.INVOICED, since);
        List<OilMartSale> pendingApprovals = sales.findByStatusOrderByQuotedAtDesc(OilMartSaleStatus.ORDERED);
        List<OilMartStockView> lowStock = stockQueries.lowStock();

        BigDecimal salesThisPeriod = invoiced.stream()
                .map(OilMartSale::getTotal)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        return new OilMartOverviewSnapshot(
                stockQueries.totalStockValue(),
                salesThisPeriod,
                invoiced.size(),
                pendingApprovals.size(),
                lowStock.size(),
                trend(invoiced, from),
                revenueByMethod(invoiced),
                lowStock,
                pendingApprovals);
    }

    private List<OilMartOverviewSnapshot.TrendPoint> trend(List<OilMartSale> invoiced, LocalDate from) {
        Map<LocalDate, BigDecimal> byDay = new TreeMap<>();
        for (int offset = 0; offset < TREND_DAYS; offset++) {
            byDay.put(from.plusDays(offset), BigDecimal.ZERO);
        }
        for (OilMartSale sale : invoiced) {
            if (sale.getInvoicedAt() == null) {
                continue;
            }
            LocalDate day = sale.getInvoicedAt().atZone(ZoneOffset.UTC).toLocalDate();
            byDay.computeIfPresent(day, (key, running) -> running.add(sale.getTotal()));
        }
        return byDay.entrySet().stream()
                .map(entry -> new OilMartOverviewSnapshot.TrendPoint(entry.getKey(), entry.getValue()))
                .toList();
    }

    private List<OilMartOverviewSnapshot.RevenueByMethod> revenueByMethod(List<OilMartSale> invoiced) {
        Map<OilMartPaymentMethod, BigDecimal> totals = new EnumMap<>(OilMartPaymentMethod.class);
        for (OilMartSale sale : invoiced) {
            if (sale.getPaymentMethod() == null) {
                continue;
            }
            totals.merge(sale.getPaymentMethod(), sale.getTotal(), BigDecimal::add);
        }
        return totals.entrySet().stream()
                .map(entry -> new OilMartOverviewSnapshot.RevenueByMethod(entry.getKey(), entry.getValue()))
                .toList();
    }

    public long trendDays() {
        return ChronoUnit.DAYS.between(LocalDate.now().minusDays(TREND_DAYS - 1L), LocalDate.now()) + 1;
    }
}
