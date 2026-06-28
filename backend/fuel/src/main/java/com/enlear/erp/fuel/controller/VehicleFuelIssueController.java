package com.enlear.erp.fuel.controller;

import com.enlear.erp.fuel.controller.dto.CreateVehicleFuelIssueRequest;
import com.enlear.erp.fuel.controller.dto.FuelResponses.VehicleEfficiencyResponse;
import com.enlear.erp.fuel.controller.dto.FuelResponses.VehicleFuelIssueResponse;
import com.enlear.erp.fuel.service.VehicleFuelIssueService;
import com.enlear.erp.shared.web.PageResponse;
import jakarta.validation.Valid;
import java.net.URI;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

/** Daily vehicle fuel issues from the vehicle tank. */
@RestController
@RequestMapping("/api/fuel/vehicle-issues")
public class VehicleFuelIssueController {

    private final VehicleFuelIssueService issues;

    public VehicleFuelIssueController(VehicleFuelIssueService issues) {
        this.issues = issues;
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN','STORE_KEEPER')")
    public ResponseEntity<VehicleFuelIssueResponse> create(
            @Valid @RequestBody CreateVehicleFuelIssueRequest request) {
        var issue = issues.createIssue(request.toCommand());
        return ResponseEntity
                .created(URI.create("/api/fuel/vehicle-issues/" + issue.getId()))
                .body(VehicleFuelIssueResponse.from(issue));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN','STORE_KEEPER')")
    public VehicleFuelIssueResponse get(@PathVariable UUID id) {
        return VehicleFuelIssueResponse.from(issues.getIssue(id));
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN','STORE_KEEPER')")
    public PageResponse<VehicleFuelIssueResponse> list(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date,
            @RequestParam(required = false) UUID vehicleId,
            @PageableDefault(size = 50) Pageable pageable) {
        return PageResponse.of(issues.list(date, vehicleId, pageable), VehicleFuelIssueResponse::from);
    }

    @GetMapping("/efficiency-report")
    @PreAuthorize("hasRole('ADMIN')")
    public List<VehicleEfficiencyResponse> efficiencyReport(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to,
            @RequestParam(required = false) UUID vehicleId) {
        return issues.getEfficiencyReport(from, to, vehicleId).stream()
                .map(VehicleEfficiencyResponse::from)
                .toList();
    }
}
