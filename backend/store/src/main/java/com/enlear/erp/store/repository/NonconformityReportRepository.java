package com.enlear.erp.store.repository;

import com.enlear.erp.store.model.DetectionStage;
import com.enlear.erp.store.model.NonconformityReport;
import com.enlear.erp.store.model.NonconformityStatus;
import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface NonconformityReportRepository extends JpaRepository<NonconformityReport, UUID> {

    List<NonconformityReport> findByDetectionStageOrderByReportedAtDesc(DetectionStage detectionStage);

    List<NonconformityReport> findByStatusOrderByReportedAtDesc(NonconformityStatus status);

    List<NonconformityReport> findAllByOrderByReportedAtDesc();

    long countByStatus(NonconformityStatus status);

    long countByDetectionStage(DetectionStage detectionStage);

    /** Every nonconforming item line across all reports, newest first. */
    @Query("select r.id as reportId, ri.itemId as itemId, ri.quantity as quantity, "
            + "r.status as status, r.detectionStage as detectionStage, r.description as description, "
            + "r.reportedAt as reportedAt "
            + "from NonconformityReport r join r.items ri "
            + "order by r.reportedAt desc")
    List<NonconformityItemLine> findAllItemLines();

    /** Nonconforming item lines limited to a single detection stage, newest first. */
    @Query("select r.id as reportId, ri.itemId as itemId, ri.quantity as quantity, "
            + "r.status as status, r.detectionStage as detectionStage, r.description as description, "
            + "r.reportedAt as reportedAt "
            + "from NonconformityReport r join r.items ri "
            + "where r.detectionStage = :detectionStage "
            + "order by r.reportedAt desc")
    List<NonconformityItemLine> findItemLinesByDetectionStage(
            @Param("detectionStage") DetectionStage detectionStage);

    /** Flattened projection: one row per nonconforming item line with its report context. */
    interface NonconformityItemLine {
        UUID getReportId();

        UUID getItemId();

        BigDecimal getQuantity();

        NonconformityStatus getStatus();

        DetectionStage getDetectionStage();

        String getDescription();

        Instant getReportedAt();
    }
}
