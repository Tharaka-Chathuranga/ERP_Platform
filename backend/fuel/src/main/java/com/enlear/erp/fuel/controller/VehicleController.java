package com.enlear.erp.fuel.controller;

import com.enlear.erp.fuel.controller.dto.CreateVehicleRequest;
import com.enlear.erp.fuel.controller.dto.FuelResponses.VehicleResponse;
import com.enlear.erp.fuel.controller.dto.UpdateVehicleRequest;
import com.enlear.erp.fuel.service.VehicleService;
import com.enlear.erp.shared.web.PageResponse;
import jakarta.validation.Valid;
import java.net.URI;
import java.util.UUID;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

/** Vehicle master. Keepers may read; only admins manage the master data. */
@RestController
@RequestMapping("/api/fuel/vehicles")
public class VehicleController {

    private final VehicleService vehicles;

    public VehicleController(VehicleService vehicles) {
        this.vehicles = vehicles;
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<VehicleResponse> create(@Valid @RequestBody CreateVehicleRequest request) {
        var vehicle = vehicles.createVehicle(request.toCommand());
        return ResponseEntity
                .created(URI.create("/api/fuel/vehicles/" + vehicle.getId()))
                .body(VehicleResponse.from(vehicle));
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN','STORE_KEEPER')")
    public PageResponse<VehicleResponse> list(
            @RequestParam(required = false) String search,
            @PageableDefault(size = 50, sort = "vehicleNumber") Pageable pageable) {
        return PageResponse.of(vehicles.listVehicles(search, pageable), VehicleResponse::from);
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN','STORE_KEEPER')")
    public VehicleResponse get(@PathVariable UUID id) {
        return VehicleResponse.from(vehicles.getVehicle(id));
    }

    @PatchMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public VehicleResponse update(@PathVariable UUID id,
                                  @Valid @RequestBody UpdateVehicleRequest request) {
        return VehicleResponse.from(vehicles.updateVehicle(id, request.toCommand()));
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @PreAuthorize("hasRole('ADMIN')")
    public void deactivate(@PathVariable UUID id) {
        vehicles.deactivateVehicle(id);
    }
}
