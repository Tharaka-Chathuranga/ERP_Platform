package com.enlear.erp.store.repository;

import com.enlear.erp.store.model.Supplier;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface SupplierRepository extends JpaRepository<Supplier, UUID> {

    boolean existsByCode(String code);
}
