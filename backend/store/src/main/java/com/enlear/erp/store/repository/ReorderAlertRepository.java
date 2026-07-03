package com.enlear.erp.store.repository;

import com.enlear.erp.store.model.ReorderAlert;
import com.enlear.erp.store.model.ReorderAlertStatus;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ReorderAlertRepository extends JpaRepository<ReorderAlert, UUID> {

    Optional<ReorderAlert> findByItemIdAndStatus(UUID itemId, ReorderAlertStatus status);

    boolean existsByItemIdAndStatus(UUID itemId, ReorderAlertStatus status);
}
