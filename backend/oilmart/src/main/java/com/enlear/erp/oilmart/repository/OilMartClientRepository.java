package com.enlear.erp.oilmart.repository;

import com.enlear.erp.oilmart.model.OilMartClient;
import java.util.List;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface OilMartClientRepository extends JpaRepository<OilMartClient, UUID> {

    List<OilMartClient> findAllByOrderByNameAsc();

    boolean existsByCodeIgnoreCase(String code);

    @Query("select c from OilMartClient c "
            + "where lower(c.code) like lower(concat('%', :search, '%')) "
            + "   or lower(c.name) like lower(concat('%', :search, '%')) "
            + "   or lower(coalesce(c.contactPerson, '')) like lower(concat('%', :search, '%')) "
            + "order by c.name asc")
    List<OilMartClient> search(@Param("search") String search);
}
