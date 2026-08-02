package com.enlear.erp.oilmart.repository;

import com.enlear.erp.oilmart.model.OilMartInvoice;
import com.enlear.erp.oilmart.model.OilMartInvoiceStatus;
import jakarta.persistence.LockModeType;
import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface OilMartInvoiceRepository extends JpaRepository<OilMartInvoice, UUID> {

    List<OilMartInvoice> findAllByOrderByInvoiceDateDescInvoiceNoDesc();

    List<OilMartInvoice> findByStatusOrderByInvoiceDateDescInvoiceNoDesc(OilMartInvoiceStatus status);

    List<OilMartInvoice> findByClientIdOrderByInvoiceDateDescInvoiceNoDesc(UUID clientId);

    long countByStatus(OilMartInvoiceStatus status);

    boolean existsByQuotationIdAndStatusNot(UUID quotationId, OilMartInvoiceStatus status);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("select i from OilMartInvoice i where i.id = :id")
    Optional<OilMartInvoice> findByIdForUpdate(@Param("id") UUID id);

    @Query("""
            select i from OilMartInvoice i
            where i.status = :status and i.approvedAt >= :since
            order by i.approvedAt desc
            """)
    List<OilMartInvoice> findApprovedSince(@Param("status") OilMartInvoiceStatus status,
                                           @Param("since") Instant since);
}
