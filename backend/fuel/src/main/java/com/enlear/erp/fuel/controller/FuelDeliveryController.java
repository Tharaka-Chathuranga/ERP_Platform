package com.enlear.erp.fuel.controller;

import com.enlear.erp.fuel.controller.dto.FuelResponses.DeliveryResponse;
import com.enlear.erp.fuel.controller.dto.RecordFuelDeliveryRequest;
import com.enlear.erp.fuel.service.delivery.FuelDeliveryService;
import com.enlear.erp.shared.web.PageResponse;
import jakarta.validation.Valid;
import java.net.URI;
import java.time.LocalDate;
import java.util.UUID;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

/**
 * Supplier fuel deliveries: the ordered/delivered quantities, discharge timing
 * and per-tank dip readings recorded on each delivery. Adds fuel to the tanks.
 */
@RestController
@RequestMapping("/api/fuel/deliveries")
public class FuelDeliveryController {

    private final FuelDeliveryService deliveries;

    public FuelDeliveryController(FuelDeliveryService deliveries) {
        this.deliveries = deliveries;
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN','STORE_KEEPER')")
    public ResponseEntity<DeliveryResponse> record(@Valid @RequestBody RecordFuelDeliveryRequest request) {
        var delivery = deliveries.record(request.toCommand());
        return ResponseEntity
                .created(URI.create("/api/fuel/deliveries/" + delivery.getId()))
                .body(DeliveryResponse.from(delivery));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN','STORE_KEEPER')")
    public DeliveryResponse get(@PathVariable UUID id) {
        return DeliveryResponse.from(deliveries.get(id));
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN','STORE_KEEPER')")
    public PageResponse<DeliveryResponse> list(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date,
            @PageableDefault(size = 50) Pageable pageable) {
        return PageResponse.of(deliveries.list(date, pageable), DeliveryResponse::from);
    }
}
