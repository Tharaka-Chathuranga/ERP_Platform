package com.enlear.erp.store.repository;

import com.enlear.erp.store.domain.DeviationRequest;
import com.enlear.erp.store.domain.DeviationStage;
import java.util.List;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface DeviationRequestRepository extends JpaRepository<DeviationRequest, UUID> {

    List<DeviationRequest> findByStageOrderByRequestedAtDesc(DeviationStage stage);

    List<DeviationRequest> findByItemIdOrderByRequestedAtDesc(UUID itemId);
}
