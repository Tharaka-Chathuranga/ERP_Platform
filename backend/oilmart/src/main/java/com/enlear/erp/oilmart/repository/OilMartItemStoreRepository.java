package com.enlear.erp.oilmart.repository;

import com.enlear.erp.oilmart.model.OilMartItemStore;
import jakarta.persistence.LockModeType;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface OilMartItemStoreRepository extends JpaRepository<OilMartItemStore, UUID> {

    List<OilMartItemStore> findAll();

    Optional<OilMartItemStore> findByItemId(UUID itemId);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("select s from OilMartItemStore s where s.itemId = :itemId")
    Optional<OilMartItemStore> findByItemIdForUpdate(@Param("itemId") UUID itemId);
}
