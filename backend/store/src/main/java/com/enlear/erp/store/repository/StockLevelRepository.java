package com.enlear.erp.store.repository;

import com.enlear.erp.store.domain.StockLevel;
import jakarta.persistence.LockModeType;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface StockLevelRepository extends JpaRepository<StockLevel, UUID> {

    Optional<StockLevel> findByItemIdAndWarehouseId(UUID itemId, UUID warehouseId);

    List<StockLevel> findByItemId(UUID itemId);

    List<StockLevel> findByWarehouseId(UUID warehouseId);

    /**
     * Pessimistically locks the stock-level row (SELECT … FOR UPDATE) so two
     * concurrent movements against the same item/warehouse are serialised at the
     * database, preventing oversell. Used inside the stock-posting transaction.
     */
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("select s from StockLevel s where s.itemId = :itemId and s.warehouseId = :warehouseId")
    Optional<StockLevel> findForUpdate(@Param("itemId") UUID itemId,
                                       @Param("warehouseId") UUID warehouseId);
}
