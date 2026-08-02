package com.enlear.erp.oilmart.repository;

import com.enlear.erp.oilmart.model.OilMartSale;
import com.enlear.erp.oilmart.model.OilMartSaleStatus;
import java.time.Instant;
import java.util.List;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface OilMartSaleRepository extends JpaRepository<OilMartSale, UUID> {

    List<OilMartSale> findAllByOrderByQuotedAtDesc();

    List<OilMartSale> findByStatusOrderByQuotedAtDesc(OilMartSaleStatus status);

    List<OilMartSale> findByClientIdOrderByQuotedAtDesc(UUID clientId);

    long countByStatus(OilMartSaleStatus status);

    @Query("select s from OilMartSale s where s.status = :status and s.invoicedAt >= :since "
            + "order by s.invoicedAt desc")
    List<OilMartSale> findInvoicedSince(@Param("status") OilMartSaleStatus status,
                                        @Param("since") Instant since);
}
