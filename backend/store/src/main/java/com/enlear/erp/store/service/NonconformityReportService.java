package com.enlear.erp.store.service;

import com.enlear.erp.shared.error.ResourceNotFoundException;
import com.enlear.erp.store.model.DetectionStage;
import com.enlear.erp.store.model.DispositionType;
import com.enlear.erp.store.model.NonconformityReport;
import com.enlear.erp.store.model.NonconformityStatus;
import com.enlear.erp.store.repository.ItemRepository;
import com.enlear.erp.store.repository.NonconformityReportRepository;
import com.enlear.erp.store.service.command.CreateNonconformityReportCommand;
import java.util.List;
import java.util.UUID;
import org.hibernate.Hibernate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
public class NonconformityReportService {

    private final NonconformityReportRepository reports;
    private final ItemRepository items;

    public NonconformityReportService(NonconformityReportRepository reports, ItemRepository items) {
        this.reports = reports;
        this.items = items;
    }

    public NonconformityReport create(CreateNonconformityReportCommand cmd) {
        NonconformityReport report =
                new NonconformityReport(cmd.description(), cmd.reportedByUserId(), cmd.detectionStage());
        for (CreateNonconformityReportCommand.Line line : cmd.items()) {
            if (!items.existsById(line.itemId())) {
                throw new ResourceNotFoundException("Item", line.itemId());
            }
            report.addItem(line.itemId(), line.quantity());
        }
        return reports.save(report);
    }

    public NonconformityReport startReview(UUID id) {
        NonconformityReport report = get(id);
        report.startReview();
        return reports.save(report);
    }

    public NonconformityReport disposition(UUID id, UUID authorityId, DispositionType type, String note) {
        NonconformityReport report = get(id);
        report.disposition(authorityId, type, note);
        return reports.save(report);
    }

    public NonconformityReport reject(UUID id, UUID authorityId, String note) {
        NonconformityReport report = get(id);
        report.reject(authorityId, note);
        return reports.save(report);
    }

    public NonconformityReport close(UUID id, UUID closedByUserId, String verificationNote) {
        NonconformityReport report = get(id);
        report.close(closedByUserId, verificationNote);
        return reports.save(report);
    }

    @Transactional(readOnly = true)
    public NonconformityReport get(UUID id) {
        NonconformityReport report = reports.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("NonconformityReport", id));
        Hibernate.initialize(report.getItems());
        return report;
    }

    @Transactional(readOnly = true)
    public List<NonconformityReport> listByDetectionStage(DetectionStage detectionStage) {
        List<NonconformityReport> found = reports.findByDetectionStageOrderByReportedAtDesc(detectionStage);
        found.forEach(report -> Hibernate.initialize(report.getItems()));
        return found;
    }

    @Transactional(readOnly = true)
    public List<NonconformityReport> listByStatus(NonconformityStatus status) {
        List<NonconformityReport> found = status != null
                ? reports.findByStatusOrderByReportedAtDesc(status)
                : reports.findAllByOrderByReportedAtDesc();
        found.forEach(report -> Hibernate.initialize(report.getItems()));
        return found;
    }
}
