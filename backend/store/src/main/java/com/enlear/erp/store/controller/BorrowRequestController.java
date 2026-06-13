package com.enlear.erp.store.controller;

import com.enlear.erp.store.service.BorrowRequestService;
import com.enlear.erp.store.controller.dto.CreateBorrowRequestRequest;
import com.enlear.erp.store.controller.dto.RequestResponses.BorrowRequestResponse;
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
@RequestMapping("/api/store/borrow-requests")
public class BorrowRequestController {

    private final BorrowRequestService requests;

    public BorrowRequestController(BorrowRequestService requests) {
        this.requests = requests;
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN','STORE_KEEPER')")
    public ResponseEntity<BorrowRequestResponse> create(
            @Valid @RequestBody CreateBorrowRequestRequest request) {
        var req = requests.create(request.toCommand());
        return ResponseEntity
                .created(URI.create("/api/store/borrow-requests/" + req.getId()))
                .body(BorrowRequestResponse.from(req));
    }

    @PostMapping("/{id}/approve")
    @PreAuthorize("hasRole('ADMIN')")
    public BorrowRequestResponse approve(@PathVariable UUID id, @RequestParam UUID approverId) {
        return BorrowRequestResponse.from(requests.approve(id, approverId));
    }

    @PostMapping("/{id}/reject")
    @PreAuthorize("hasRole('ADMIN')")
    public BorrowRequestResponse reject(@PathVariable UUID id, @RequestParam UUID approverId) {
        return BorrowRequestResponse.from(requests.reject(id, approverId));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN','STORE_KEEPER')")
    public BorrowRequestResponse get(@PathVariable UUID id) {
        return BorrowRequestResponse.from(requests.get(id));
    }

    /** Processing list: all borrow requests, or filtered by status / requesting user. */
    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN','STORE_KEEPER')")
    public List<BorrowRequestResponse> list(
            @RequestParam(required = false) UUID userId,
            @RequestParam(required = false) com.enlear.erp.store.model.BorrowRequestStatus status) {
        var list = userId != null ? requests.listForUser(userId) : requests.list(status);
        return list.stream().map(BorrowRequestResponse::from).toList();
    }
}
