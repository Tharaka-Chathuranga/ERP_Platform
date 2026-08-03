package com.enlear.erp.oilmart.repository;

import com.enlear.erp.oilmart.model.OilMartItem;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface OilMartItemRepository extends JpaRepository<OilMartItem, UUID> {

    List<OilMartItem> findAllByOrderByNameAsc();

    Optional<OilMartItem> findByCodeIgnoreCase(String code);

    boolean existsByCodeIgnoreCase(String code);

    @Query("select i from OilMartItem i "
            + "where lower(i.code) like lower(concat('%', :search, '%')) "
            + "   or lower(i.name) like lower(concat('%', :search, '%')) "
            + "   or lower(coalesce(i.brand, '')) like lower(concat('%', :search, '%')) "
            + "order by i.name asc")
    List<OilMartItem> search(@Param("search") String search);
}
