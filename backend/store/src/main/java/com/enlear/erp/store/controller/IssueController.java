package com.enlear.erp.store.controller;

import com.enlear.erp.shared.web.PageResponse;
import com.enlear.erp.store.service.IssueService;
import com.enlear.erp.store.controller.dto.CreateIssueRequest;
import com.enlear.erp.store.controller.dto.IssueResponses.IssueResponse;
import com.enlear.erp.store.controller.dto.ReturnItemsRequest;
import jakarta.validation.Valid;
import java.net.URI;
import java.util.UUID;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
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
@RequestMapping("/api/store/issues")
public class IssueController {

    private final IssueService issues;

    public IssueController(IssueService issues) {
        this.issues = issues;
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN','STORE_KEEPER')")
    public ResponseEntity<IssueResponse> create(@Valid @RequestBody CreateIssueRequest request) {
        var issue = issues.createIssue(request.toCommand());
        return ResponseEntity
                .created(URI.create("/api/store/issues/" + issue.getId()))
                .body(IssueResponse.from(issue));
    }

    @PostMapping("/{id}/approve")
    @PreAuthorize("hasRole('ADMIN')")
    public IssueResponse approve(@PathVariable UUID id, @RequestParam UUID approverId) {
        return IssueResponse.from(issues.approve(id, approverId));
    }

    @PostMapping("/{id}/reject")
    @PreAuthorize("hasRole('ADMIN')")
    public IssueResponse reject(@PathVariable UUID id, @RequestParam UUID approverId) {
        return IssueResponse.from(issues.reject(id, approverId));
    }

    /** Physically issue an APPROVED document — posts ISSUE movements. */
    @PostMapping("/{id}/issue")
    @PreAuthorize("hasAnyRole('ADMIN','STORE_KEEPER')")
    public IssueResponse issue(@PathVariable UUID id) {
        return IssueResponse.from(issues.issue(id));
    }

    @PostMapping("/{id}/returns")
    @PreAuthorize("hasAnyRole('ADMIN','STORE_KEEPER')")
    public IssueResponse returnItems(@PathVariable UUID id,
                                     @Valid @RequestBody ReturnItemsRequest request) {
        return IssueResponse.from(issues.returnItems(request.toCommand(id)));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN','STORE_KEEPER')")
    public IssueResponse get(@PathVariable UUID id) {
        return IssueResponse.from(issues.getIssue(id));
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN','STORE_KEEPER')")
    public PageResponse<IssueResponse> list(
            @RequestParam(required = false) UUID borrowingUserId,
            @RequestParam(required = false) com.enlear.erp.store.model.IssueStatus status,
            @PageableDefault(size = 20) Pageable pageable) {
        var page = borrowingUserId != null
                ? issues.listForUser(borrowingUserId, pageable)
                : issues.list(status, pageable);
        return PageResponse.of(page, IssueResponse::from);
    }
}
