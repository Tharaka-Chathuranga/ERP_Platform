package com.enlear.erp.store.repository;

import com.enlear.erp.store.domain.Warehouse;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface WarehouseRepository extends JpaRepository<Warehouse, UUID> {

    Optional<Warehouse> findByCode(String code);

    boolean existsByCode(String code);
}
