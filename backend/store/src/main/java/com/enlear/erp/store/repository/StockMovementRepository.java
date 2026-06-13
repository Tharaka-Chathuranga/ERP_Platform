package com.enlear.erp.store.repository;

import com.enlear.erp.store.model.MovementType;
import com.enlear.erp.store.model.StockMovement;
import java.math.BigDecimal;
import java.util.UUID;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface StockMovementRepository extends JpaRepository<StockMovement, UUID> {

    Page<StockMovement> findByItemIdOrderByOccurredAtDesc(UUID itemId, Pageable pageable);

    /** Derived on-hand quantity for an item: sum of the signed movement ledger. */
    @Query("select coalesce(sum(case when m.type in :inbound then m.quantity else -m.quantity end), 0) from StockMovement m where m.itemId = :itemId")
    BigDecimal sumOnHand(@Param("itemId") UUID itemId, @Param("inbound") java.util.Collection<MovementType> inbound);
}
