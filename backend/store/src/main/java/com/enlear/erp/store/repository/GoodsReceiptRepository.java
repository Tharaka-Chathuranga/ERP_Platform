package com.enlear.erp.store.repository;

import com.enlear.erp.store.domain.GoodsReceipt;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

public interface GoodsReceiptRepository extends JpaRepository<GoodsReceipt, UUID> {

    boolean existsByGrnNumber(String grnNumber);

    /** Fetches a GRN with its lines eagerly (open-in-view is off). */
    @EntityGraph(attributePaths = "lines")
    Optional<GoodsReceipt> findWithLinesById(UUID id);

    @EntityGraph(attributePaths = "lines")
    Page<GoodsReceipt> findBySupplierIdOrderByReceivedAtDesc(UUID supplierId, Pageable pageable);

    @EntityGraph(attributePaths = "lines")
    Page<GoodsReceipt> findAllByOrderByReceivedAtDesc(Pageable pageable);
}
