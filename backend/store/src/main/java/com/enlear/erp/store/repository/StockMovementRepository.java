package com.enlear.erp.store.repository;

import com.enlear.erp.store.model.MovementType;
import com.enlear.erp.store.model.StockMovement;
import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface StockMovementRepository extends JpaRepository<StockMovement, UUID> {

    Page<StockMovement> findByItemIdOrderByOccurredAtDesc(UUID itemId, Pageable pageable);

    /** All movements across every item, newest first. */
    Page<StockMovement> findAllByOrderByOccurredAtDesc(Pageable pageable);

    /**
     * Per-item received vs issued totals, busiest items first. Lets the chart
     * show what actually moved instead of one aggregate number.
     */
    @Query("select m.itemId as itemId, "
            + "sum(case when m.type = :received then m.quantity else 0 end) as received, "
            + "sum(case when m.type = :issued then m.quantity else 0 end) as issued "
            + "from StockMovement m "
            + "group by m.itemId "
            + "order by sum(m.quantity) desc")
    List<ItemMovementTotals> sumByItem(
            @Param("received") MovementType received,
            @Param("issued") MovementType issued,
            Pageable pageable);

    /** Projection for {@link #sumByItem}. */
    interface ItemMovementTotals {
        UUID getItemId();

        BigDecimal getReceived();

        BigDecimal getIssued();
    }
}
