package com.enlear.erp.store.controller;

import com.enlear.erp.store.controller.dto.CountAdjustmentResponses.CountAdjustmentResponse;
import com.enlear.erp.store.controller.dto.CreateCountAdjustmentRequest;
import com.enlear.erp.store.model.CountAdjustmentStatus;
import com.enlear.erp.store.service.StockCountAdjustmentService;
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
@RequestMapping("/api/store/count-requests")
public class CountAdjustmentController {

    private final StockCountAdjustmentService service;

    public CountAdjustmentController(StockCountAdjustmentService service) {
        this.service = service;
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN','STORE_KEEPER')")
    public ResponseEntity<CountAdjustmentResponse> create(
            @Valid @RequestBody CreateCountAdjustmentRequest request) {
        var created = service.create(request.toCommand());
        return ResponseEntity
                .created(URI.create("/api/store/count-requests/" + created.getId()))
                .body(CountAdjustmentResponse.from(created));
    }

    @PostMapping("/{id}/approve")
    @PreAuthorize("hasRole('ADMIN')")
    public CountAdjustmentResponse approve(@PathVariable UUID id, @RequestParam UUID approverId) {
        return CountAdjustmentResponse.from(service.approve(id, approverId));
    }

    @PostMapping("/{id}/reject")
    @PreAuthorize("hasRole('ADMIN')")
    public CountAdjustmentResponse reject(@PathVariable UUID id, @RequestParam UUID approverId) {
        return CountAdjustmentResponse.from(service.reject(id, approverId));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN','STORE_KEEPER')")
    public CountAdjustmentResponse get(@PathVariable UUID id) {
        return CountAdjustmentResponse.from(service.get(id));
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN','STORE_KEEPER')")
    public List<CountAdjustmentResponse> list(
            @RequestParam(required = false) CountAdjustmentStatus status) {
        return service.list(status).stream().map(CountAdjustmentResponse::from).toList();
    }
}
