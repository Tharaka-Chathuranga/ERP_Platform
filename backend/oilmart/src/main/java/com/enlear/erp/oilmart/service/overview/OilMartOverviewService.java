package com.enlear.erp.oilmart.service.overview;

import com.enlear.erp.oilmart.model.OilMartInvoice;
import com.enlear.erp.oilmart.model.OilMartInvoiceStatus;
import com.enlear.erp.oilmart.model.OilMartQuotation;
import com.enlear.erp.oilmart.model.OilMartQuotationStatus;
import com.enlear.erp.oilmart.repository.OilMartInvoiceRepository;
import com.enlear.erp.oilmart.repository.OilMartQuotationRepository;
import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneOffset;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.Map;
import java.util.TreeMap;
import org.hibernate.Hibernate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional(readOnly = true)
public class OilMartOverviewService {

    private static final int TREND_DAYS = 7;

    private final OilMartQuotationRepository quotations;
    private final OilMartInvoiceRepository invoices;
    private final OilMartStockQueryService stockQueries;

    public OilMartOverviewService(OilMartQuotationRepository quotations,
                                  OilMartInvoiceRepository invoices,
                                  OilMartStockQueryService stockQueries) {
        this.quotations = quotations;
        this.invoices = invoices;
        this.stockQueries = stockQueries;
    }

    public OilMartOverviewSnapshot snapshot() {
        LocalDate today = LocalDate.now();
        LocalDate from = today.minusDays(TREND_DAYS - 1L);
        Instant since = from.atStartOfDay(ZoneOffset.UTC).toInstant();

        List<OilMartInvoice> approved =
                invoices.findApprovedSince(OilMartInvoiceStatus.APPROVED, since);
        List<OilMartQuotation> pendingApprovals = quotations
                .findByStatusOrderByIssuedDateDescQuotationNoDesc(
                        OilMartQuotationStatus.PENDING_APPROVAL);
        pendingApprovals.forEach(quotation -> Hibernate.initialize(quotation.getLines()));
        List<OilMartStockView> lowStock = stockQueries.lowStock();

        long awaitingApproval = pendingApprovals.size()
                + invoices.countByStatus(OilMartInvoiceStatus.PENDING_APPROVAL);

        BigDecimal salesThisPeriod = approved.stream()
                .map(OilMartInvoice::getGrandTotal)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        return new OilMartOverviewSnapshot(
                stockQueries.totalStockValue(),
                salesThisPeriod,
                approved.size(),
                awaitingApproval,
                lowStock.size(),
                trend(approved, from),
                lowStock,
                pendingApprovals);
    }

    private List<OilMartOverviewSnapshot.TrendPoint> trend(List<OilMartInvoice> approved,
                                                           LocalDate from) {
        Map<LocalDate, BigDecimal> byDay = new TreeMap<>();
        for (int offset = 0; offset < TREND_DAYS; offset++) {
            byDay.put(from.plusDays(offset), BigDecimal.ZERO);
        }
        for (OilMartInvoice invoice : approved) {
            byDay.computeIfPresent(invoice.getInvoiceDate(),
                    (key, running) -> running.add(invoice.getGrandTotal()));
        }
        return byDay.entrySet().stream()
                .map(entry -> new OilMartOverviewSnapshot.TrendPoint(entry.getKey(), entry.getValue()))
                .toList();
    }

    public long trendDays() {
        return ChronoUnit.DAYS.between(LocalDate.now().minusDays(TREND_DAYS - 1L), LocalDate.now()) + 1;
    }
}
