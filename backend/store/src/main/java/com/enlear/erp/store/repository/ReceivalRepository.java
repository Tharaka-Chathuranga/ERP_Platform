package com.enlear.erp.store.repository;

import com.enlear.erp.store.model.Receival;
import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ReceivalRepository extends JpaRepository<Receival, UUID> {

    boolean existsByReceivalNumber(String receivalNumber);

    /** Fetches a receival with its lines eagerly (open-in-view is off). */
    @EntityGraph(attributePaths = "lines")
    Optional<Receival> findWithLinesById(UUID id);

    /** Open receivals for a PO — those not yet rolled into a generated GRN. */
    @EntityGraph(attributePaths = "lines")
    List<Receival> findByPoNumberAndGoodReceiveNoteIdIsNull(String poNumber);

    @EntityGraph(attributePaths = "lines")
    Page<Receival> findAllByOrderByReceivedAtDesc(Pageable pageable);

    @EntityGraph(attributePaths = "lines")
    Page<Receival> findBySupplierIdOrderByReceivedAtDesc(UUID supplierId, Pageable pageable);

    /** Receivals recorded within the half-open instant range [start, end), newest first. */
    @EntityGraph(attributePaths = "lines")
    List<Receival> findByReceivedAtGreaterThanEqualAndReceivedAtLessThanOrderByReceivedAtDesc(
            Instant start, Instant end);
}
