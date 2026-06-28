package com.enlear.erp.fuel.controller;

import com.enlear.erp.fuel.controller.dto.FuelResponses.ReadingResponse;
import com.enlear.erp.fuel.controller.dto.FuelResponses.RefillResponse;
import com.enlear.erp.fuel.controller.dto.FuelResponses.TankResponse;
import com.enlear.erp.fuel.controller.dto.RecordReadingRequest;
import com.enlear.erp.fuel.controller.dto.RecordRefillRequest;
import com.enlear.erp.fuel.controller.dto.UpdateTankRequest;
import com.enlear.erp.fuel.service.FuelTankReadingService;
import com.enlear.erp.fuel.service.FuelTankRefillService;
import com.enlear.erp.fuel.service.FuelTankService;
import jakarta.validation.Valid;
import java.util.List;
import java.util.UUID;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * Tank master data plus its refill and reading sub-resources. Reads/daily ops
 * are open to keepers; editing a tank's master fields is admin-only.
 */
@RestController
@RequestMapping("/api/fuel/tanks")
public class FuelTankController {

    private final FuelTankService tanks;
    private final FuelTankRefillService refills;
    private final FuelTankReadingService readings;

    public FuelTankController(FuelTankService tanks, FuelTankRefillService refills,
                              FuelTankReadingService readings) {
        this.tanks = tanks;
        this.refills = refills;
        this.readings = readings;
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN','STORE_KEEPER')")
    public List<TankResponse> list() {
        return tanks.listTanks().stream().map(TankResponse::from).toList();
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN','STORE_KEEPER')")
    public TankResponse get(@PathVariable UUID id) {
        return TankResponse.from(tanks.getTank(id));
    }

    @PatchMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public TankResponse update(@PathVariable UUID id, @Valid @RequestBody UpdateTankRequest request) {
        return TankResponse.from(tanks.updateDetails(id, request.name(), request.capacityLitres()));
    }

    // ── Refills ─────────────────────────────────────────────────────

    @PostMapping("/{id}/refills")
    @PreAuthorize("hasAnyRole('ADMIN','STORE_KEEPER')")
    public RefillResponse recordRefill(@PathVariable UUID id,
                                       @Valid @RequestBody RecordRefillRequest request) {
        return RefillResponse.from(refills.recordRefill(request.toCommand(id)));
    }

    @GetMapping("/{id}/refills")
    @PreAuthorize("hasAnyRole('ADMIN','STORE_KEEPER')")
    public List<RefillResponse> listRefills(@PathVariable UUID id) {
        return refills.listForTank(id).stream().map(RefillResponse::from).toList();
    }

    // ── Readings ────────────────────────────────────────────────────

    @PostMapping("/{id}/readings")
    @PreAuthorize("hasAnyRole('ADMIN','STORE_KEEPER')")
    public ReadingResponse recordReading(@PathVariable UUID id,
                                         @Valid @RequestBody RecordReadingRequest request) {
        readings.recordReading(request.toCommand(id));
        // Return the latest reading with its derived consumption.
        return ReadingResponse.from(readings.latestForTank(id));
    }

    @GetMapping("/{id}/readings")
    @PreAuthorize("hasAnyRole('ADMIN','STORE_KEEPER')")
    public List<ReadingResponse> listReadings(@PathVariable UUID id) {
        return readings.listForTankWithConsumption(id).stream().map(ReadingResponse::from).toList();
    }
}
