package com.enlear.erp.store.repository;

import com.enlear.erp.store.model.Issue;
import com.enlear.erp.store.model.IssueStatus;
import java.time.Instant;
import java.util.List;
import java.util.UUID;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

public interface IssueRepository extends JpaRepository<Issue, UUID> {

    boolean existsByIssueNumber(String issueNumber);

    Page<Issue> findByBorrowingUserIdOrderByCreatedAtDesc(UUID borrowingUserId, Pageable pageable);

    Page<Issue> findByStatusOrderByCreatedAtDesc(IssueStatus status, Pageable pageable);

    Page<Issue> findAllByOrderByCreatedAtDesc(Pageable pageable);

    long countByStatus(IssueStatus status);

    /** Issues physically issued within the half-open instant range [start, end), newest first. */
    @EntityGraph(attributePaths = "lines")
    List<Issue> findByStatusAndIssuedAtGreaterThanEqualAndIssuedAtLessThanOrderByIssuedAtDesc(
            IssueStatus status, Instant start, Instant end);

    @EntityGraph(attributePaths = "lines")
    List<Issue> findByCreatedAtGreaterThanEqualAndCreatedAtLessThanOrderByCreatedAtDesc(
            Instant start, Instant end);
}
