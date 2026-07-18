package com.enlear.erp.store.controller;

import com.enlear.erp.store.controller.dto.CreateNonconformityReportRequest;
import com.enlear.erp.store.controller.dto.NonconformityReviewRequests.CloseRequest;
import com.enlear.erp.store.controller.dto.NonconformityReviewRequests.DispositionRequest;
import com.enlear.erp.store.controller.dto.NonconformityReviewRequests.RejectRequest;
import com.enlear.erp.store.controller.dto.RequestResponses.NonconformityReportResponse;
import com.enlear.erp.store.model.DetectionStage;
import com.enlear.erp.store.model.NonconformityStatus;
import com.enlear.erp.store.service.NonconformityReportService;
import jakarta.validation.Valid;
import java.net.URI;
import java.util.List;
import java.util.UUID;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/store/nonconformities")
public class NonconformityReportController {

    private final NonconformityReportService reports;

    public NonconformityReportController(NonconformityReportService reports) {
        this.reports = reports;
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN','STORE_KEEPER')")
    public ResponseEntity<NonconformityReportResponse> create(
            @Valid @RequestBody CreateNonconformityReportRequest request) {
        var report = reports.create(request.toCommand());
        return ResponseEntity
                .created(URI.create("/api/store/nonconformities/" + report.getId()))
                .body(NonconformityReportResponse.from(report));
    }

    @PostMapping("/{id}/review")
    @PreAuthorize("hasAnyRole('ADMIN','QUALITY_ASSURANCE')")
    public NonconformityReportResponse startReview(@PathVariable UUID id) {
        return NonconformityReportResponse.from(reports.startReview(id));
    }

    @PostMapping("/{id}/disposition")
    @PreAuthorize("hasAnyRole('ADMIN','QUALITY_ASSURANCE')")
    public NonconformityReportResponse disposition(@PathVariable UUID id,
                                                   @Valid @RequestBody DispositionRequest request) {
        return NonconformityReportResponse.from(
                reports.disposition(id, request.authorityId(), request.dispositionType(), request.note()));
    }

    @PostMapping("/{id}/reject")
    @PreAuthorize("hasAnyRole('ADMIN','QUALITY_ASSURANCE')")
    public NonconformityReportResponse reject(@PathVariable UUID id,
                                              @Valid @RequestBody RejectRequest request) {
        return NonconformityReportResponse.from(
                reports.reject(id, request.authorityId(), request.note()));
    }

    @PostMapping("/{id}/close")
    @PreAuthorize("hasAnyRole('ADMIN','QUALITY_ASSURANCE')")
    public NonconformityReportResponse close(@PathVariable UUID id,
                                             @Valid @RequestBody CloseRequest request) {
        return NonconformityReportResponse.from(
                reports.close(id, request.closedByUserId(), request.verificationNote()));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN','STORE_KEEPER','QUALITY_ASSURANCE')")
    public NonconformityReportResponse get(@PathVariable UUID id) {
        return NonconformityReportResponse.from(reports.get(id));
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN','STORE_KEEPER','QUALITY_ASSURANCE')")
    public List<NonconformityReportResponse> listByDetectionStage(
            @RequestParam DetectionStage detectionStage) {
        return reports.listByDetectionStage(detectionStage).stream()
                .map(NonconformityReportResponse::from).toList();
    }

    @GetMapping("/by-status")
    @PreAuthorize("hasAnyRole('ADMIN','QUALITY_ASSURANCE')")
    public List<NonconformityReportResponse> listByStatus(
            @RequestParam(required = false) NonconformityStatus status) {
        return reports.listByStatus(status).stream()
                .map(NonconformityReportResponse::from).toList();
    }
}
