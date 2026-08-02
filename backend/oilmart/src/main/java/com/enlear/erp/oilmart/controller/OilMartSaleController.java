package com.enlear.erp.oilmart.controller;

import com.enlear.erp.oilmart.controller.dto.OilMartRequests.CancelOilMartSaleRequest;
import com.enlear.erp.oilmart.controller.dto.OilMartRequests.CreateOilMartSaleRequest;
import com.enlear.erp.oilmart.controller.dto.OilMartRequests.DispatchOilMartSaleRequest;
import com.enlear.erp.oilmart.controller.dto.OilMartRequests.InvoiceOilMartSaleRequest;
import com.enlear.erp.oilmart.controller.dto.OilMartRequests.RejectOilMartSaleRequest;
import com.enlear.erp.oilmart.controller.dto.OilMartResponses.OilMartSaleResponse;
import com.enlear.erp.oilmart.model.OilMartSaleStatus;
import com.enlear.erp.oilmart.service.selling.OilMartSaleService;
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
@RequestMapping("/api/oilmart/sales")
public class OilMartSaleController {

    private final OilMartSaleService sales;
    private final OilMartResponseAssembler assembler;

    public OilMartSaleController(OilMartSaleService sales, OilMartResponseAssembler assembler) {
        this.sales = sales;
        this.assembler = assembler;
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN','OIL_MART_ASSISTANT','STORES_MANAGER')")
    public List<OilMartSaleResponse> list(@RequestParam(required = false) OilMartSaleStatus status) {
        return assembler.toSaleResponses(sales.list(status));
    }

    @GetMapping("/{saleId}")
    @PreAuthorize("hasAnyRole('ADMIN','OIL_MART_ASSISTANT','STORES_MANAGER')")
    public OilMartSaleResponse get(@PathVariable UUID saleId) {
        return assembler.toResponse(sales.get(saleId));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN','OIL_MART_ASSISTANT')")
    public ResponseEntity<OilMartSaleResponse> create(
            @Valid @RequestBody CreateOilMartSaleRequest request) {
        var sale = sales.createQuotation(request.toCommand());
        return ResponseEntity
                .created(URI.create("/api/oilmart/sales/" + sale.getId()))
                .body(assembler.toResponse(sale));
    }

    @PostMapping("/{saleId}/confirm")
    @PreAuthorize("hasAnyRole('ADMIN','OIL_MART_ASSISTANT')")
    public OilMartSaleResponse confirmOrder(@PathVariable UUID saleId) {
        return assembler.toResponse(sales.confirmOrder(saleId));
    }

    @PostMapping("/{saleId}/approve")
    @PreAuthorize("hasAnyRole('ADMIN','STORES_MANAGER')")
    public OilMartSaleResponse approve(@PathVariable UUID saleId) {
        return assembler.toResponse(sales.approve(saleId));
    }

    @PostMapping("/{saleId}/reject")
    @PreAuthorize("hasAnyRole('ADMIN','STORES_MANAGER')")
    public OilMartSaleResponse reject(@PathVariable UUID saleId,
                                      @Valid @RequestBody RejectOilMartSaleRequest request) {
        return assembler.toResponse(sales.reject(saleId, request.reason()));
    }

    @PostMapping("/{saleId}/dispatch")
    @PreAuthorize("hasAnyRole('ADMIN','OIL_MART_ASSISTANT')")
    public OilMartSaleResponse dispatch(@PathVariable UUID saleId,
                                        @Valid @RequestBody DispatchOilMartSaleRequest request) {
        return assembler.toResponse(sales.dispatch(saleId, request.toCommand()));
    }

    @PostMapping("/{saleId}/invoice")
    @PreAuthorize("hasAnyRole('ADMIN','OIL_MART_ASSISTANT')")
    public OilMartSaleResponse invoice(@PathVariable UUID saleId,
                                       @Valid @RequestBody InvoiceOilMartSaleRequest request) {
        return assembler.toResponse(sales.raiseInvoice(saleId, request.paymentMethod()));
    }

    @PostMapping("/{saleId}/cancel")
    @PreAuthorize("hasAnyRole('ADMIN','OIL_MART_ASSISTANT')")
    public OilMartSaleResponse cancel(@PathVariable UUID saleId,
                                      @Valid @RequestBody CancelOilMartSaleRequest request) {
        return assembler.toResponse(sales.cancel(saleId, request.reason()));
    }
}
