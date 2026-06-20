package com.enlear.erp.store.repository;

import com.enlear.erp.store.model.BorrowRequest;
import com.enlear.erp.store.model.BorrowRequestStatus;
import java.util.List;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface BorrowRequestRepository extends JpaRepository<BorrowRequest, UUID> {

    List<BorrowRequest> findByRequestedByUserIdOrderByRequestedAtDesc(UUID requestedByUserId);

    List<BorrowRequest> findByStatusOrderByRequestedAtDesc(BorrowRequestStatus status);

    long countByStatus(BorrowRequestStatus status);
}
