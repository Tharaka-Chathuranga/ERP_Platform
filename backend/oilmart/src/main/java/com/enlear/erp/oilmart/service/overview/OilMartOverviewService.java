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

    public OilMartOverviewSnapshot snapshot(OilMartOverviewPeriod period) {
        LocalDate today = LocalDate.now();
        Instant since = period.startOn(today).atStartOfDay(ZoneOffset.UTC).toInstant();
        Instant until = period.endOn(today).atStartOfDay(ZoneOffset.UTC).toInstant();

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
                period,
                period.bucket(),
                stockQueries.totalStockValue(),
                salesThisPeriod,
                approved.size(),
                awaitingApproval,
                lowStock.size(),
                trend(approved, since, until, period.bucket()),
                lowStock,
                pendingApprovals);
    }

    private List<OilMartOverviewSnapshot.TrendPoint> trend(List<OilMartInvoice> approved,
                                                           Instant since,
                                                           Instant until,
                                                           ChronoUnit bucket) {
        Map<Instant, BigDecimal> byBucket = new TreeMap<>();
        for (Instant at = since.truncatedTo(bucket); at.isBefore(until); at = at.plus(1, bucket)) {
            byBucket.put(at, BigDecimal.ZERO);
        }

        for (OilMartInvoice invoice : approved) {
            if (invoice.getApprovedAt() == null) {
                continue;
            }
            Instant at = invoice.getApprovedAt().truncatedTo(bucket);
            byBucket.computeIfPresent(at, (key, running) -> running.add(invoice.getGrandTotal()));
        }

        return byBucket.entrySet().stream()
                .map(entry -> new OilMartOverviewSnapshot.TrendPoint(entry.getKey(), entry.getValue()))
                .toList();
    }
}
