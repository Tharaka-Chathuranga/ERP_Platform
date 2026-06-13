package com.enlear.erp.store.repository;

import com.enlear.erp.store.model.SupplierItem;
import java.util.List;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface SupplierItemRepository extends JpaRepository<SupplierItem, UUID> {

    List<SupplierItem> findBySupplierId(UUID supplierId);

    List<SupplierItem> findByItemId(UUID itemId);

    boolean existsBySupplierIdAndItemId(UUID supplierId, UUID itemId);
}
