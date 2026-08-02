package com.enlear.erp.oilmart.repository;

import com.enlear.erp.oilmart.model.OilMartQuotation;
import com.enlear.erp.oilmart.model.OilMartQuotationStatus;
import java.util.List;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface OilMartQuotationRepository extends JpaRepository<OilMartQuotation, UUID> {

    List<OilMartQuotation> findAllByOrderByIssuedDateDescQuotationNoDesc();

    List<OilMartQuotation> findByStatusOrderByIssuedDateDescQuotationNoDesc(
            OilMartQuotationStatus status);

    List<OilMartQuotation> findByClientIdOrderByIssuedDateDescQuotationNoDesc(UUID clientId);

    long countByStatus(OilMartQuotationStatus status);
}
