package com.enlear.erp.store.repository;

import com.enlear.erp.store.model.CountAdjustmentStatus;
import com.enlear.erp.store.model.StockCountAdjustmentRequest;
import java.util.List;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface StockCountAdjustmentRequestRepository
        extends JpaRepository<StockCountAdjustmentRequest, UUID> {

    List<StockCountAdjustmentRequest> findAllByOrderByRequestedAtDesc();

    List<StockCountAdjustmentRequest> findByStatusOrderByRequestedAtDesc(CountAdjustmentStatus status);

    long countByStatus(CountAdjustmentStatus status);
}
