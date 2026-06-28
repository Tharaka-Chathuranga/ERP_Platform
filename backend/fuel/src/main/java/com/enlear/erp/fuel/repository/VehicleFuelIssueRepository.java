package com.enlear.erp.fuel.repository;

import com.enlear.erp.fuel.model.VehicleFuelIssue;
import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface VehicleFuelIssueRepository extends JpaRepository<VehicleFuelIssue, UUID> {

    Page<VehicleFuelIssue> findByIssuedAtBetweenOrderByIssuedAtDesc(
            Instant from, Instant to, Pageable pageable);

    Page<VehicleFuelIssue> findByVehicleIdAndIssuedAtBetweenOrderByIssuedAtDesc(
            UUID vehicleId, Instant from, Instant to, Pageable pageable);

    Page<VehicleFuelIssue> findByVehicleIdOrderByIssuedAtDesc(UUID vehicleId, Pageable pageable);

    Page<VehicleFuelIssue> findAllByOrderByIssuedAtDesc(Pageable pageable);

    long countByIssuedAtBetween(Instant from, Instant to);

    @Query("select coalesce(sum(i.litresIssued), 0) from VehicleFuelIssue i "
            + "where i.issuedAt >= :from and i.issuedAt < :to")
    BigDecimal sumLitresIssuedBetween(@Param("from") Instant from, @Param("to") Instant to);

    /** All issues that carry an odometer reading within [from, to), grouped for efficiency computation. */
    List<VehicleFuelIssue> findByOdometerReadingKmNotNullAndIssuedAtBetweenOrderByVehicleIdAscIssuedAtAsc(
            Instant from, Instant to);

    /** Most recent odometer-carrying issue for a vehicle strictly before {@code before}. */
    Optional<VehicleFuelIssue> findTopByVehicleIdAndOdometerReadingKmNotNullAndIssuedAtBeforeOrderByIssuedAtDesc(
            UUID vehicleId, Instant before);
}
