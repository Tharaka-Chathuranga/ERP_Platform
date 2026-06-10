package com.enlear.erp.store.web;

import com.enlear.erp.store.service.SupplierService;
import com.enlear.erp.store.web.dto.AddSupplierItemRequest;
import com.enlear.erp.store.web.dto.CreateSupplierRequest;
import com.enlear.erp.store.web.dto.SupplierResponses.SupplierItemResponse;
import com.enlear.erp.store.web.dto.SupplierResponses.SupplierResponse;
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
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/store/suppliers")
public class SupplierController {

    private final SupplierService suppliers;

    public SupplierController(SupplierService suppliers) {
        this.suppliers = suppliers;
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN','STORE_MANAGER')")
    public ResponseEntity<SupplierResponse> create(@Valid @RequestBody CreateSupplierRequest request) {
        var supplier = suppliers.createSupplier(request.toCommand());
        return ResponseEntity
                .created(URI.create("/api/store/suppliers/" + supplier.getId()))
                .body(SupplierResponse.from(supplier));
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN','STORE_MANAGER','STORE_CLERK')")
    public List<SupplierResponse> list() {
        return suppliers.listSuppliers().stream().map(SupplierResponse::from).toList();
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN','STORE_MANAGER','STORE_CLERK')")
    public SupplierResponse get(@PathVariable UUID id) {
        return SupplierResponse.from(suppliers.getSupplier(id));
    }

    @PostMapping("/{id}/items")
    @PreAuthorize("hasAnyRole('ADMIN','STORE_MANAGER')")
    public ResponseEntity<SupplierItemResponse> addItem(
            @PathVariable UUID id, @Valid @RequestBody AddSupplierItemRequest request) {
        var link = suppliers.addItem(request.toCommand(id));
        return ResponseEntity.ok(SupplierItemResponse.from(link));
    }

    @GetMapping("/{id}/items")
    @PreAuthorize("hasAnyRole('ADMIN','STORE_MANAGER','STORE_CLERK')")
    public List<SupplierItemResponse> items(@PathVariable UUID id) {
        return suppliers.listItemsForSupplier(id).stream()
                .map(SupplierItemResponse::from).toList();
    }
}
