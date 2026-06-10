package com.enlear.erp.store.repository;

import com.enlear.erp.store.domain.GoodsReceipt;
import java.util.UUID;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

public interface GoodsReceiptRepository extends JpaRepository<GoodsReceipt, UUID> {

    boolean existsByGrnNumber(String grnNumber);

    Page<GoodsReceipt> findBySupplierIdOrderByReceivedAtDesc(UUID supplierId, Pageable pageable);
}
