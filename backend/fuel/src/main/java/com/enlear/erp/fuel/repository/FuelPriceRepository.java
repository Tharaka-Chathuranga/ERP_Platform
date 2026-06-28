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

    /** Any existing price whose range overlaps [from, to] — used to reject overlaps. */
    @Query("select count(p) from FuelPrice p "
            + "where p.effectiveFrom <= :to and :from <= p.effectiveTo")
    long countOverlapping(@Param("from") LocalDate from, @Param("to") LocalDate to);

    /** The price effective on a given date, if any. */
    @Query("select p from FuelPrice p "
            + "where p.effectiveFrom <= :date and :date <= p.effectiveTo "
            + "order by p.effectiveFrom desc")
    Optional<FuelPrice> findEffectiveOn(@Param("date") LocalDate date);
}
