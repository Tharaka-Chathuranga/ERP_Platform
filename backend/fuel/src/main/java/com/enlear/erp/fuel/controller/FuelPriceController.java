package com.enlear.erp.fuel.controller;

import com.enlear.erp.fuel.controller.dto.CreateFuelPriceRequest;
import com.enlear.erp.fuel.controller.dto.FuelResponses.FuelPriceResponse;
import com.enlear.erp.fuel.service.FuelPriceService;
import jakarta.validation.Valid;
import java.net.URI;
import java.time.LocalDate;
import java.util.List;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/** Append-only fuel price history. Keepers may read; only admins add prices. */
@RestController
@RequestMapping("/api/fuel/prices")
public class FuelPriceController {

    private final FuelPriceService prices;

    public FuelPriceController(FuelPriceService prices) {
        this.prices = prices;
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<FuelPriceResponse> add(@Valid @RequestBody CreateFuelPriceRequest request) {
        var price = prices.addPrice(request.toCommand());
        return ResponseEntity
                .created(URI.create("/api/fuel/prices/" + price.getId()))
                .body(FuelPriceResponse.from(price));
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN','STORE_KEEPER')")
    public List<FuelPriceResponse> history() {
        return prices.listHistory().stream().map(FuelPriceResponse::from).toList();
    }

    @GetMapping("/current")
    @PreAuthorize("hasAnyRole('ADMIN','STORE_KEEPER')")
    public ResponseEntity<FuelPriceResponse> current() {
        return prices.priceOn(LocalDate.now())
                .map(FuelPriceResponse::from)
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.noContent().build());
    }
}
