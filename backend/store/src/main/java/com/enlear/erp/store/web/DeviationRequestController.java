package com.enlear.erp.store.web;

import com.enlear.erp.store.domain.DeviationStage;
import com.enlear.erp.store.service.DeviationRequestService;
import com.enlear.erp.store.web.dto.CreateDeviationRequestRequest;
import com.enlear.erp.store.web.dto.RequestResponses.DeviationRequestResponse;
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
@RequestMapping("/api/store/deviation-requests")
public class DeviationRequestController {

    private final DeviationRequestService requests;

    public DeviationRequestController(DeviationRequestService requests) {
        this.requests = requests;
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN','STORE_KEEPER')")
    public ResponseEntity<DeviationRequestResponse> create(
            @Valid @RequestBody CreateDeviationRequestRequest request) {
        var req = requests.create(request.toCommand());
        return ResponseEntity
                .created(URI.create("/api/store/deviation-requests/" + req.getId()))
                .body(DeviationRequestResponse.from(req));
    }

    @PostMapping("/{id}/approve")
    @PreAuthorize("hasRole('ADMIN')")
    public DeviationRequestResponse approve(@PathVariable UUID id, @RequestParam UUID approverId) {
        return DeviationRequestResponse.from(requests.approve(id, approverId));
    }

    @PostMapping("/{id}/reject")
    @PreAuthorize("hasRole('ADMIN')")
    public DeviationRequestResponse reject(@PathVariable UUID id, @RequestParam UUID approverId) {
        return DeviationRequestResponse.from(requests.reject(id, approverId));
    }

    @PostMapping("/{id}/stage")
    @PreAuthorize("hasRole('ADMIN')")
    public DeviationRequestResponse advanceStage(@PathVariable UUID id,
                                                 @RequestParam DeviationStage stage) {
        return DeviationRequestResponse.from(requests.advanceStage(id, stage));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN','STORE_KEEPER')")
    public DeviationRequestResponse get(@PathVariable UUID id) {
        return DeviationRequestResponse.from(requests.get(id));
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN','STORE_KEEPER')")
    public List<DeviationRequestResponse> listByStage(@RequestParam DeviationStage stage) {
        return requests.listByStage(stage).stream().map(DeviationRequestResponse::from).toList();
    }
}
