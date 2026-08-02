package com.enlear.erp.oilmart.controller;

import com.enlear.erp.oilmart.controller.dto.OilMartRequests.CancelOilMartDocumentRequest;
import com.enlear.erp.oilmart.controller.dto.OilMartRequests.RejectOilMartDocumentRequest;
import com.enlear.erp.oilmart.controller.dto.OilMartRequests.SaveOilMartQuotationRequest;
import com.enlear.erp.oilmart.controller.dto.OilMartResponses.OilMartQuotationResponse;
import com.enlear.erp.oilmart.model.OilMartQuotationStatus;
import com.enlear.erp.oilmart.service.selling.OilMartQuotationService;
import jakarta.validation.Valid;
import java.net.URI;
import java.util.List;
import java.util.UUID;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/oilmart/quotations")
public class OilMartQuotationController {

    private final OilMartQuotationService quotations;
    private final OilMartResponseAssembler assembler;

    public OilMartQuotationController(OilMartQuotationService quotations,
                                      OilMartResponseAssembler assembler) {
        this.quotations = quotations;
        this.assembler = assembler;
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN','OIL_MART_ASSISTANT','STORES_MANAGER')")
    public List<OilMartQuotationResponse> list(
            @RequestParam(required = false) OilMartQuotationStatus status) {
        return assembler.toQuotationResponses(quotations.list(status));
    }

    @GetMapping("/{quotationId}")
    @PreAuthorize("hasAnyRole('ADMIN','OIL_MART_ASSISTANT','STORES_MANAGER')")
    public OilMartQuotationResponse get(@PathVariable UUID quotationId) {
        return assembler.toResponse(quotations.get(quotationId));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN','OIL_MART_ASSISTANT','STORES_MANAGER')")
    public ResponseEntity<OilMartQuotationResponse> create(
            @Valid @RequestBody SaveOilMartQuotationRequest request) {
        var quotation = quotations.create(request.toCommand());
        return ResponseEntity
                .created(URI.create("/api/oilmart/quotations/" + quotation.getId()))
                .body(assembler.toResponse(quotation));
    }

    @PutMapping("/{quotationId}")
    @PreAuthorize("hasAnyRole('ADMIN','OIL_MART_ASSISTANT','STORES_MANAGER')")
    public OilMartQuotationResponse revise(@PathVariable UUID quotationId,
                                           @Valid @RequestBody SaveOilMartQuotationRequest request) {
        return assembler.toResponse(quotations.revise(quotationId, request.toCommand()));
    }

    @PostMapping("/{quotationId}/submit")
    @PreAuthorize("hasAnyRole('ADMIN','OIL_MART_ASSISTANT','STORES_MANAGER')")
    public OilMartQuotationResponse submitForApproval(@PathVariable UUID quotationId) {
        return assembler.toResponse(quotations.submitForApproval(quotationId));
    }

    @PostMapping("/{quotationId}/approve")
    @PreAuthorize("hasAnyRole('ADMIN','STORES_MANAGER')")
    public OilMartQuotationResponse approve(@PathVariable UUID quotationId) {
        return assembler.toResponse(quotations.approve(quotationId));
    }

    @PostMapping("/{quotationId}/reject")
    @PreAuthorize("hasAnyRole('ADMIN','STORES_MANAGER')")
    public OilMartQuotationResponse reject(@PathVariable UUID quotationId,
                                           @Valid @RequestBody RejectOilMartDocumentRequest request) {
        return assembler.toResponse(quotations.reject(quotationId, request.reason()));
    }

    @PostMapping("/{quotationId}/cancel")
    @PreAuthorize("hasAnyRole('ADMIN','OIL_MART_ASSISTANT','STORES_MANAGER')")
    public OilMartQuotationResponse cancel(@PathVariable UUID quotationId,
                                           @Valid @RequestBody CancelOilMartDocumentRequest request) {
        return assembler.toResponse(quotations.cancel(quotationId, request.reason()));
    }
}
