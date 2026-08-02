package com.enlear.erp.oilmart.repository;

import com.enlear.erp.oilmart.model.OilMartQuotation;
import com.enlear.erp.oilmart.model.OilMartQuotationStatus;
import jakarta.persistence.LockModeType;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface OilMartQuotationRepository extends JpaRepository<OilMartQuotation, UUID> {

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("select q from OilMartQuotation q where q.id = :id")
    Optional<OilMartQuotation> findByIdForUpdate(@Param("id") UUID id);

    List<OilMartQuotation> findAllByOrderByIssuedDateDescQuotationNoDesc();

    List<OilMartQuotation> findByStatusOrderByIssuedDateDescQuotationNoDesc(
            OilMartQuotationStatus status);

    List<OilMartQuotation> findByClientIdOrderByIssuedDateDescQuotationNoDesc(UUID clientId);

    long countByStatus(OilMartQuotationStatus status);
}
