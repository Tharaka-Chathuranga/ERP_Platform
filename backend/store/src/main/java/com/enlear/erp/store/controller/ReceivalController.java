package com.enlear.erp.store.controller;

import com.enlear.erp.shared.web.PageResponse;
import com.enlear.erp.store.service.ReceivalService;
import com.enlear.erp.store.controller.dto.CreateReceivalRequest;
import com.enlear.erp.store.controller.dto.ReceivalResponses.ReceivalResponse;
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
@RequestMapping("/api/store/receivals")
public class ReceivalController {

    private final ReceivalService receivals;

    public ReceivalController(ReceivalService receivals) {
        this.receivals = receivals;
    }

    /** Records a receival: posts stock and generates a GRN per the PO rules. */
    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN','STORE_KEEPER')")
    public ResponseEntity<ReceivalResponse> create(@Valid @RequestBody CreateReceivalRequest request) {
        var receival = receivals.create(request.toCommand());
        return ResponseEntity
                .created(URI.create("/api/store/receivals/" + receival.getId()))
                .body(ReceivalResponse.from(receival));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN','STORE_KEEPER')")
    public ReceivalResponse get(@PathVariable UUID id) {
        return ReceivalResponse.from(receivals.get(id));
    }

    /** Lists receivals; filters by supplier when {@code supplierId} is given. */
    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN','STORE_KEEPER')")
    public PageResponse<ReceivalResponse> list(
            @RequestParam(required = false) UUID supplierId,
            @PageableDefault(size = 20) Pageable pageable) {
        return PageResponse.of(receivals.list(supplierId, pageable), ReceivalResponse::from);
    }
}
