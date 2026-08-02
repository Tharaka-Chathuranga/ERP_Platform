package com.enlear.erp.oilmart.repository;

import com.enlear.erp.oilmart.model.OilMartReceipt;
import java.util.List;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface OilMartReceiptRepository extends JpaRepository<OilMartReceipt, UUID> {

    List<OilMartReceipt> findAllByOrderByReceivedAtDesc();

    List<OilMartReceipt> findBySupplierIdOrderByReceivedAtDesc(UUID supplierId);
}
