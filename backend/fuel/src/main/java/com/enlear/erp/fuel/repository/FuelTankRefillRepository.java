package com.enlear.erp.fuel.repository;

import com.enlear.erp.fuel.model.FuelTankRefill;
import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface FuelTankRefillRepository extends JpaRepository<FuelTankRefill, UUID> {

    List<FuelTankRefill> findByTankIdOrderByRefilledAtDesc(UUID tankId);

    /** Total litres refilled into a tank within a half-open window (from, to]. */
    @Query("select coalesce(sum(r.litres), 0) from FuelTankRefill r "
            + "where r.tankId = :tankId and r.refilledAt > :from and r.refilledAt <= :to")
    BigDecimal sumLitresBetween(@Param("tankId") UUID tankId,
                                @Param("from") Instant from,
                                @Param("to") Instant to);
}
