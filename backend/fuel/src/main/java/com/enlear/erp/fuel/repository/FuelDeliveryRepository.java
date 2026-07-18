package com.enlear.erp.fuel.repository;

import com.enlear.erp.fuel.model.FuelDelivery;
import java.time.LocalDate;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

public interface FuelDeliveryRepository extends JpaRepository<FuelDelivery, UUID> {

    boolean existsByDeliveryReference(String deliveryReference);

    /** Fetches a delivery with its tank lines eagerly (open-in-view is off). */
    @EntityGraph(attributePaths = "lines")
    Optional<FuelDelivery> findWithLinesById(UUID id);

    @EntityGraph(attributePaths = "lines")
    Page<FuelDelivery> findAllByOrderByDeliveredOnDescCreatedAtDesc(Pageable pageable);

    @EntityGraph(attributePaths = "lines")
    Page<FuelDelivery> findByDeliveredOnOrderByCreatedAtDesc(LocalDate deliveredOn, Pageable pageable);

    long countByDeliveredOn(LocalDate deliveredOn);
}
