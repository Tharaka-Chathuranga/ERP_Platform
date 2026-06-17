package com.enlear.erp.store.repository;

import com.enlear.erp.store.model.MovementType;
import com.enlear.erp.store.model.StockMovement;
import java.math.BigDecimal;
import java.time.Instant;
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

    /**
     * Received vs issued totals bucketed by day since {@code since}, oldest day
     * first — the data behind the movement-trend chart. Native query because the
     * day bucketing ({@code date_trunc}) is database-specific.
     */
    @Query(value = """
            select date_trunc('day', occurred_at) as day,
                   coalesce(sum(case when type = 'RECEIPT' then quantity else 0 end), 0) as received,
                   coalesce(sum(case when type = 'ISSUE' then quantity else 0 end), 0) as issued
            from store.stock_movements
            where occurred_at >= :since
            group by date_trunc('day', occurred_at)
            order by day
            """, nativeQuery = true)
    List<DailyMovementTotals> dailyTotalsSince(@Param("since") Instant since);

    /** Projection for {@link #dailyTotalsSince}. */
    interface DailyMovementTotals {
        Instant getDay();

        BigDecimal getReceived();

        BigDecimal getIssued();
    }
}
