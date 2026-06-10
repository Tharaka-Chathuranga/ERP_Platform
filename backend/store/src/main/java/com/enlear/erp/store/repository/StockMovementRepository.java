package com.enlear.erp.store.repository;

import com.enlear.erp.store.domain.StockMovement;
import java.util.UUID;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

public interface StockMovementRepository extends JpaRepository<StockMovement, UUID> {

    Page<StockMovement> findByItemIdOrderByOccurredAtDesc(UUID itemId, Pageable pageable);

    Page<StockMovement> findByItemIdAndWarehouseIdOrderByOccurredAtDesc(
            UUID itemId, UUID warehouseId, Pageable pageable);
}
