package com.enlear.erp.fuel.service;

import com.enlear.erp.fuel.model.Vehicle;
import com.enlear.erp.fuel.repository.VehicleRepository;
import com.enlear.erp.fuel.service.command.CreateVehicleCommand;
import com.enlear.erp.fuel.service.command.UpdateVehicleCommand;
import com.enlear.erp.shared.error.BusinessRuleException;
import com.enlear.erp.shared.error.ResourceNotFoundException;
import java.util.UUID;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

/** Vehicle master CRUD. */
@Service
@Transactional
public class VehicleService {

    private final VehicleRepository vehicles;

    public VehicleService(VehicleRepository vehicles) {
        this.vehicles = vehicles;
    }

    public Vehicle createVehicle(CreateVehicleCommand cmd) {
        if (vehicles.existsByVehicleNumber(cmd.vehicleNumber())) {
            throw new BusinessRuleException("FUEL_DUPLICATE_VEHICLE_NUMBER",
                    "A vehicle with number '%s' already exists".formatted(cmd.vehicleNumber()));
        }
        Vehicle vehicle = new Vehicle(cmd.vehicleNumber(), cmd.name(), cmd.category(),
                cmd.fullTankCapacityLitres(), cmd.description(), cmd.driverUserId());
        return vehicles.save(vehicle);
    }

    @Transactional(readOnly = true)
    public Vehicle getVehicle(UUID id) {
        return vehicles.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Vehicle", id));
    }

    @Transactional(readOnly = true)
    public Page<Vehicle> listVehicles(String search, Pageable pageable) {
        if (StringUtils.hasText(search)) {
            return vehicles.findByVehicleNumberContainingIgnoreCaseOrDescriptionContainingIgnoreCase(
                    search, search, pageable);
        }
        return vehicles.findAll(pageable);
    }

    public Vehicle updateVehicle(UUID id, UpdateVehicleCommand cmd) {
        Vehicle vehicle = getVehicle(id);
        if (vehicles.existsByVehicleNumberAndIdNot(cmd.vehicleNumber(), id)) {
            throw new BusinessRuleException("FUEL_DUPLICATE_VEHICLE_NUMBER",
                    "A vehicle with number '%s' already exists".formatted(cmd.vehicleNumber()));
        }
        vehicle.updateDetails(cmd.vehicleNumber(), cmd.name(), cmd.category(),
                cmd.fullTankCapacityLitres(), cmd.description(), cmd.driverUserId());
        return vehicles.save(vehicle);
    }

    public void deactivateVehicle(UUID id) {
        Vehicle vehicle = getVehicle(id);
        vehicle.deactivate();
        vehicles.save(vehicle);
    }
}
