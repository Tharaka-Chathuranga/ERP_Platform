package com.enlear.erp.fuel.repository;

import com.enlear.erp.fuel.model.FuelTankReading;
import java.time.Instant;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface FuelTankReadingRepository extends JpaRepository<FuelTankReading, UUID> {

    java.util.List<FuelTankReading> findByTankIdOrderByReadingAtDesc(UUID tankId);

    /** The reading immediately before a point in time, for consumption deltas. */
    Optional<FuelTankReading> findFirstByTankIdAndReadingAtLessThanOrderByReadingAtDesc(
            UUID tankId, Instant readingAt);

    Optional<FuelTankReading> findFirstByTankIdOrderByReadingAtDesc(UUID tankId);
}
