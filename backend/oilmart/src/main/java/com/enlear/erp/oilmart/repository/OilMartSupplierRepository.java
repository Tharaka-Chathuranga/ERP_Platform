package com.enlear.erp.oilmart.repository;

import com.enlear.erp.oilmart.model.OilMartSupplier;
import java.util.List;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface OilMartSupplierRepository extends JpaRepository<OilMartSupplier, UUID> {

    List<OilMartSupplier> findAllByOrderByNameAsc();

    boolean existsByCodeIgnoreCase(String code);
}
