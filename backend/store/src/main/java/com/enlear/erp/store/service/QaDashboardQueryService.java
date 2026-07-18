package com.enlear.erp.store.service;

import com.enlear.erp.store.controller.dto.QaDashboardResponses.QaNonconformitySummaryResponse;
import com.enlear.erp.store.model.DetectionStage;
import com.enlear.erp.store.model.NonconformityStatus;
import com.enlear.erp.store.repository.NonconformityReportRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional(readOnly = true)
public class QaDashboardQueryService {

    private final NonconformityReportRepository reports;

    public QaDashboardQueryService(NonconformityReportRepository reports) {
        this.reports = reports;
    }

    public QaNonconformitySummaryResponse nonconformitySummary() {
        long raised = reports.countByStatus(NonconformityStatus.RAISED);
        long underReview = reports.countByStatus(NonconformityStatus.UNDER_REVIEW);
        long dispositioned = reports.countByStatus(NonconformityStatus.DISPOSITIONED);
        long rejected = reports.countByStatus(NonconformityStatus.REJECTED);
        long closed = reports.countByStatus(NonconformityStatus.CLOSED);
        return new QaNonconformitySummaryResponse(
                raised,
                underReview,
                dispositioned,
                rejected,
                closed,
                reports.countByDetectionStage(DetectionStage.INCOMING),
                reports.countByDetectionStage(DetectionStage.IN_PROGRESS),
                reports.countByDetectionStage(DetectionStage.FINAL),
                raised + underReview + dispositioned + rejected + closed);
    }
}
