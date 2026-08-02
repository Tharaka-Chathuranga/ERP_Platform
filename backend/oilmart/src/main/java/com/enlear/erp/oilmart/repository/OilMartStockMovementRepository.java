package com.enlear.erp.oilmart.repository;

import com.enlear.erp.oilmart.model.OilMartStockMovement;
import java.util.List;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface OilMartStockMovementRepository extends JpaRepository<OilMartStockMovement, UUID> {

    List<OilMartStockMovement> findByItemIdOrderByMovedAtDesc(UUID itemId);

    List<OilMartStockMovement> findByReferenceIdOrderByMovedAtAsc(UUID referenceId);
}
