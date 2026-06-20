package com.enlear.erp.store.service;

import com.enlear.erp.store.controller.dto.QaDashboardResponses.QaDefectSummaryResponse;
import com.enlear.erp.store.model.DeviationStage;
import com.enlear.erp.store.model.DeviationStatus;
import com.enlear.erp.store.repository.DeviationRequestRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional(readOnly = true)
public class QaDashboardQueryService {

    private final DeviationRequestRepository deviations;

    public QaDashboardQueryService(DeviationRequestRepository deviations) {
        this.deviations = deviations;
    }

    public QaDefectSummaryResponse defectSummary() {
        long pending = deviations.countByStatus(DeviationStatus.PENDING);
        long approved = deviations.countByStatus(DeviationStatus.APPROVED);
        long rejected = deviations.countByStatus(DeviationStatus.REJECTED);
        return new QaDefectSummaryResponse(
                pending,
                approved,
                rejected,
                deviations.countByStage(DeviationStage.INCOMING),
                deviations.countByStage(DeviationStage.IN_PROGRESS),
                deviations.countByStage(DeviationStage.FINAL),
                pending + approved + rejected);
    }
}
