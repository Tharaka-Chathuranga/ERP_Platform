package com.enlear.erp.fuel.repository;

import com.enlear.erp.fuel.model.Vehicle;
import java.util.UUID;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

public interface VehicleRepository extends JpaRepository<Vehicle, UUID> {

    boolean existsByVehicleNumber(String vehicleNumber);

    boolean existsByVehicleNumberAndIdNot(String vehicleNumber, UUID id);

    Page<Vehicle> findByVehicleNumberContainingIgnoreCaseOrDescriptionContainingIgnoreCase(
            String vehicleNumber, String description, Pageable pageable);
}
