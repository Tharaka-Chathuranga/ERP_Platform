package com.enlear.erp.oilmart.controller;

import com.enlear.erp.oilmart.controller.dto.OilMartRequests.CreateOilMartInvoiceRequest;
import com.enlear.erp.oilmart.controller.dto.OilMartRequests.OilMartDocumentTokenRequest;
import com.enlear.erp.oilmart.controller.dto.OilMartRequests.RejectOilMartDocumentRequest;
import com.enlear.erp.oilmart.controller.dto.OilMartRequests.ReselectOilMartQuotationRequest;
import com.enlear.erp.oilmart.controller.dto.OilMartResponses.OilMartInvoiceResponse;
import com.enlear.erp.oilmart.controller.dto.OilMartResponses.OilMartQuotationResponse;
import com.enlear.erp.oilmart.model.OilMartInvoiceStatus;
import com.enlear.erp.oilmart.service.pdf.OilMartDocumentPdfService;
import com.enlear.erp.oilmart.service.selling.OilMartInvoiceService;
import jakarta.validation.Valid;
import java.net.URI;
import java.util.List;
import java.util.UUID;
import org.springframework.http.MediaType;
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
@RequestMapping("/api/oilmart/invoices")
public class OilMartInvoiceController {

    private final OilMartInvoiceService invoices;
    private final OilMartResponseAssembler assembler;
    private final OilMartDocumentPdfService pdfs;

    public OilMartInvoiceController(OilMartInvoiceService invoices,
                                    OilMartResponseAssembler assembler,
                                    OilMartDocumentPdfService pdfs) {
        this.invoices = invoices;
        this.assembler = assembler;
        this.pdfs = pdfs;
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN','OIL_MART_ASSISTANT','STORES_MANAGER')")
    public List<OilMartInvoiceResponse> list(
            @RequestParam(required = false) OilMartInvoiceStatus status) {
        return assembler.toInvoiceResponses(invoices.list(status));
    }

    @GetMapping("/invoiceable-quotations")
    @PreAuthorize("hasAnyRole('ADMIN','OIL_MART_ASSISTANT','STORES_MANAGER')")
    public List<OilMartQuotationResponse> invoiceableQuotations() {
        return assembler.toQuotationResponses(invoices.invoiceableQuotations());
    }

    @GetMapping("/{invoiceId}")
    @PreAuthorize("hasAnyRole('ADMIN','OIL_MART_ASSISTANT','STORES_MANAGER')")
    public OilMartInvoiceResponse get(@PathVariable UUID invoiceId) {
        return assembler.toResponse(invoices.get(invoiceId));
    }

    @GetMapping(value = "/{invoiceId}/pdf", produces = MediaType.APPLICATION_PDF_VALUE)
    @PreAuthorize("hasAnyRole('ADMIN','OIL_MART_ASSISTANT','STORES_MANAGER')")
    public ResponseEntity<byte[]> pdf(@PathVariable UUID invoiceId) {
        var invoice = invoices.get(invoiceId);
        return OilMartPdfResponse.inline(pdfs.renderInvoice(invoice), invoice.getInvoiceNo());
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN','OIL_MART_ASSISTANT','STORES_MANAGER')")
    public ResponseEntity<OilMartInvoiceResponse> create(
            @Valid @RequestBody CreateOilMartInvoiceRequest request) {
        var invoice = invoices.create(request.toCommand());
        return ResponseEntity
                .created(URI.create("/api/oilmart/invoices/" + invoice.getId()))
                .body(assembler.toResponse(invoice));
    }

    @PutMapping("/{invoiceId}/quotation")
    @PreAuthorize("hasAnyRole('ADMIN','OIL_MART_ASSISTANT','STORES_MANAGER')")
    public OilMartInvoiceResponse reselectQuotation(
            @PathVariable UUID invoiceId,
            @Valid @RequestBody ReselectOilMartQuotationRequest request) {
        return assembler.toResponse(invoices.reselectQuotation(
                invoiceId, request.quotationId(), request.expectedUpdatedAt()));
    }

    @PostMapping("/{invoiceId}/approve")
    @PreAuthorize("hasAnyRole('ADMIN','STORES_MANAGER')")
    public OilMartInvoiceResponse approve(@PathVariable UUID invoiceId,
                                          @Valid @RequestBody OilMartDocumentTokenRequest request) {
        return assembler.toResponse(invoices.approve(invoiceId, request.expectedUpdatedAt()));
    }

    @PostMapping("/{invoiceId}/reject")
    @PreAuthorize("hasAnyRole('ADMIN','STORES_MANAGER')")
    public OilMartInvoiceResponse reject(@PathVariable UUID invoiceId,
                                         @Valid @RequestBody RejectOilMartDocumentRequest request) {
        return assembler.toResponse(invoices.reject(
                invoiceId, request.reason(), request.expectedUpdatedAt()));
    }
}
