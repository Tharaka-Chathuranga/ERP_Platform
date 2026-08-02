package com.enlear.erp.oilmart.repository;

import com.enlear.erp.oilmart.model.OilMartItemPrice;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface OilMartItemPriceRepository extends JpaRepository<OilMartItemPrice, UUID> {

    List<OilMartItemPrice> findByItemIdOrderByEffectiveFromDesc(UUID itemId);

    Optional<OilMartItemPrice> findTopByItemIdOrderByEffectiveFromDesc(UUID itemId);

    @Query("select p from OilMartItemPrice p where p.itemId = :itemId "
            + "and p.effectiveFrom <= :date and (p.effectiveTo is null or :date <= p.effectiveTo) "
            + "order by p.effectiveFrom desc")
    Optional<OilMartItemPrice> findEffectiveOn(@Param("itemId") UUID itemId,
                                               @Param("date") LocalDate date);

    @Query("select p from OilMartItemPrice p "
            + "where p.effectiveFrom <= :date and (p.effectiveTo is null or :date <= p.effectiveTo)")
    List<OilMartItemPrice> findAllEffectiveOn(@Param("date") LocalDate date);
}
