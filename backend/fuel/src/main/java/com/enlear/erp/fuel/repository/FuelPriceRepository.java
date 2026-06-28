package com.enlear.erp.fuel.repository;

import com.enlear.erp.fuel.model.FuelPrice;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface FuelPriceRepository extends JpaRepository<FuelPrice, UUID> {

    List<FuelPrice> findAllByOrderByEffectiveFromDesc();

    /** The most recent price by start date — the one a newly added price supersedes. */
    Optional<FuelPrice> findTopByOrderByEffectiveFromDesc();

    /** The price effective on a given date, if any (an open price has no effective_to). */
    @Query("select p from FuelPrice p "
            + "where p.effectiveFrom <= :date and (p.effectiveTo is null or :date <= p.effectiveTo) "
            + "order by p.effectiveFrom desc")
    Optional<FuelPrice> findEffectiveOn(@Param("date") LocalDate date);
}
