package com.enlear.erp.store.repository;

import com.enlear.erp.store.model.DeviationRequest;
import com.enlear.erp.store.model.DeviationStage;
import com.enlear.erp.store.model.DeviationStatus;
import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface DeviationRequestRepository extends JpaRepository<DeviationRequest, UUID> {

    List<DeviationRequest> findByStageOrderByRequestedAtDesc(DeviationStage stage);

    long countByStatus(DeviationStatus status);

    /** Every defective item line across all deviation requests, newest first. */
    @Query("select r.id as requestId, di.itemId as itemId, di.quantity as quantity, "
            + "r.status as status, r.stage as stage, r.reason as reason, r.requestedAt as requestedAt "
            + "from DeviationRequest r join r.items di "
            + "order by r.requestedAt desc")
    List<DeviationItemLine> findAllItemLines();

    /** Defective item lines limited to a single workflow stage, newest first. */
    @Query("select r.id as requestId, di.itemId as itemId, di.quantity as quantity, "
            + "r.status as status, r.stage as stage, r.reason as reason, r.requestedAt as requestedAt "
            + "from DeviationRequest r join r.items di "
            + "where r.stage = :stage "
            + "order by r.requestedAt desc")
    List<DeviationItemLine> findItemLinesByStage(@Param("stage") DeviationStage stage);

    /** Flattened projection: one row per defective item line with its request context. */
    interface DeviationItemLine {
        UUID getRequestId();

        UUID getItemId();

        BigDecimal getQuantity();

        DeviationStatus getStatus();

        DeviationStage getStage();

        String getReason();

        Instant getRequestedAt();
    }
}
