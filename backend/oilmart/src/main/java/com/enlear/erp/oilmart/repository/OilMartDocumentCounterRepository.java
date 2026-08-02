package com.enlear.erp.oilmart.repository;

import com.enlear.erp.oilmart.model.OilMartDocumentCounter;
import com.enlear.erp.oilmart.model.OilMartDocumentType;
import jakarta.persistence.LockModeType;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface OilMartDocumentCounterRepository
        extends JpaRepository<OilMartDocumentCounter, OilMartDocumentCounter.Key> {

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("select c from OilMartDocumentCounter c where c.docType = :docType and c.year = :year")
    Optional<OilMartDocumentCounter> findForUpdate(@Param("docType") OilMartDocumentType docType,
                                                   @Param("year") Integer year);
}
