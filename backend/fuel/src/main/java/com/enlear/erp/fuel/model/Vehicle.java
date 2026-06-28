package com.enlear.erp.fuel.model;

import com.enlear.erp.shared.model.BaseEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Table;
import java.math.BigDecimal;
import java.util.UUID;
import lombok.Getter;
import lombok.NoArgsConstructor;

/**
 * A vehicle that draws fuel from the vehicle tank. Its full-tank capacity caps
 * how much can be issued in one fill, and its driver is the default receiving
 * user on an issue.
 */
@Entity
@Table(name = "vehicles", schema = "fuel")
@Getter
@NoArgsConstructor
public class Vehicle extends BaseEntity {

    @Column(name = "vehicle_number", nullable = false, unique = true, length = 64)
    private String vehicleNumber;

    @Column(name = "full_tank_capacity_litres", nullable = false, precision = 19, scale = 4)
    private BigDecimal fullTankCapacityLitres;

    @Column(length = 1000)
    private String description;

    /** Default receiving user (driver); references users.users, no FK. */
    @Column(name = "driver_user_id")
    private UUID driverUserId;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 16)
    private VehicleStatus status = VehicleStatus.ACTIVE;

    public Vehicle(String vehicleNumber, BigDecimal fullTankCapacityLitres,
                   String description, UUID driverUserId) {
        this.vehicleNumber = vehicleNumber;
        this.fullTankCapacityLitres = fullTankCapacityLitres;
        this.description = description;
        this.driverUserId = driverUserId;
        this.status = VehicleStatus.ACTIVE;
    }

    public void updateDetails(String vehicleNumber, BigDecimal fullTankCapacityLitres,
                              String description, UUID driverUserId) {
        this.vehicleNumber = vehicleNumber;
        this.fullTankCapacityLitres = fullTankCapacityLitres;
        this.description = description;
        this.driverUserId = driverUserId;
    }

    public void deactivate() {
        this.status = VehicleStatus.INACTIVE;
    }

    public boolean isActive() {
        return status == VehicleStatus.ACTIVE;
    }
}
