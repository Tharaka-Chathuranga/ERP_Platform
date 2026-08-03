package com.enlear.erp.oilmart.controller;

import com.enlear.erp.oilmart.controller.dto.OilMartRequests.SaveOilMartSupplierRequest;
import com.enlear.erp.oilmart.controller.dto.OilMartResponses.OilMartSupplierResponse;
import com.enlear.erp.oilmart.service.master.OilMartSupplierService;
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
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/oilmart/suppliers")
public class OilMartSupplierController {

    private final OilMartSupplierService suppliers;

    public OilMartSupplierController(OilMartSupplierService suppliers) {
        this.suppliers = suppliers;
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN','OIL_MART_SALES_ASSISTANT','OIL_MART_SALES_MANAGER')")
    public List<OilMartSupplierResponse> list() {
        return suppliers.list().stream().map(OilMartSupplierResponse::from).toList();
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN','OIL_MART_SALES_MANAGER')")
    public ResponseEntity<OilMartSupplierResponse> create(
            @Valid @RequestBody SaveOilMartSupplierRequest request) {
        var supplier = suppliers.create(request.toCommand());
        return ResponseEntity
                .created(URI.create("/api/oilmart/suppliers/" + supplier.getId()))
                .body(OilMartSupplierResponse.from(supplier));
    }

    @PutMapping("/{supplierId}")
    @PreAuthorize("hasAnyRole('ADMIN','OIL_MART_SALES_MANAGER')")
    public OilMartSupplierResponse update(@PathVariable UUID supplierId,
                                          @Valid @RequestBody SaveOilMartSupplierRequest request) {
        return OilMartSupplierResponse.from(suppliers.update(supplierId, request.toCommand()));
    }
}
