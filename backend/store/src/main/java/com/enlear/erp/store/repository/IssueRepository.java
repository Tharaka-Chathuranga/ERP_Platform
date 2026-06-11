package com.enlear.erp.store.repository;

import com.enlear.erp.store.domain.Issue;
import com.enlear.erp.store.domain.IssueStatus;
import java.util.UUID;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

public interface IssueRepository extends JpaRepository<Issue, UUID> {

    boolean existsByIssueNumber(String issueNumber);

    Page<Issue> findByBorrowingUserIdOrderByCreatedAtDesc(UUID borrowingUserId, Pageable pageable);

    Page<Issue> findByStatusOrderByCreatedAtDesc(IssueStatus status, Pageable pageable);

    Page<Issue> findAllByOrderByCreatedAtDesc(Pageable pageable);
}
