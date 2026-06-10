package com.enlear.erp.store.web;

import com.enlear.erp.store.web.dto.CreateWarehouseRequest;
import com.enlear.erp.store.web.dto.StoreResponses.WarehouseResponse;
import com.enlear.erp.store.service.WarehouseService;
import jakarta.validation.Valid;
import java.net.URI;
import java.util.List;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/store/warehouses")
public class WarehouseController {

    private final WarehouseService warehouses;

    public WarehouseController(WarehouseService warehouses) {
        this.warehouses = warehouses;
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN','STORE_MANAGER')")
    public ResponseEntity<WarehouseResponse> create(@Valid @RequestBody CreateWarehouseRequest request) {
        var wh = warehouses.createWarehouse(request.toCommand());
        return ResponseEntity
                .created(URI.create("/api/store/warehouses/" + wh.getId()))
                .body(WarehouseResponse.from(wh));
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN','STORE_MANAGER','STORE_CLERK')")
    public List<WarehouseResponse> list() {
        return warehouses.listWarehouses().stream().map(WarehouseResponse::from).toList();
    }
}
