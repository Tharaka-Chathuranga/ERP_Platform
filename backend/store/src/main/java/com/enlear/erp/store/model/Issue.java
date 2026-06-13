package com.enlear.erp.store.model;

import com.enlear.erp.shared.model.BaseEntity;
import com.enlear.erp.shared.error.BusinessRuleException;
import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import lombok.Getter;
import lombok.NoArgsConstructor;

/**
 * An issue of stock to a user (borrowing user), optionally returnable per line.
 * Flow: DRAFT → PENDING_APPROVAL → APPROVED → ISSUED (stock leaves) → RETURNED.
 * Issuing records ISSUE movements on the ledger; returns record RECEIPT moves.
 */
@Entity
@Table(name = "issues", schema = "store")
@Getter
@NoArgsConstructor
public class Issue extends BaseEntity {

    @Column(name = "issue_number", nullable = false, unique = true, length = 32)
    private String issueNumber;

    @Column(name = "borrowing_user_id", nullable = false)
    private UUID borrowingUserId;

    @Column(name = "store_keeper_id", nullable = false)
    private UUID storeKeeperId;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private IssueStatus status = IssueStatus.DRAFT;

    @Column(name = "approved_by_user_id")
    private UUID approvedByUserId;

    @Column(name = "approved_at")
    private Instant approvedAt;

    @Column(name = "issued_at")
    private Instant issuedAt;

    @OneToMany(cascade = CascadeType.ALL, orphanRemoval = true)
    @JoinColumn(name = "issue_id", nullable = false)
    private List<IssueLine> lines = new ArrayList<>();

    public Issue(String issueNumber, UUID borrowingUserId, UUID storeKeeperId,
                 boolean requiresApproval) {
        this.issueNumber = issueNumber;
        this.borrowingUserId = borrowingUserId;
        this.storeKeeperId = storeKeeperId;
        this.status = requiresApproval ? IssueStatus.PENDING_APPROVAL : IssueStatus.APPROVED;
    }

    public void addLine(IssueLine line) {
        lines.add(line);
    }

    public void approve(UUID approverId) {
        if (status != IssueStatus.PENDING_APPROVAL) {
            throw new BusinessRuleException("STORE_ISSUE_NOT_PENDING",
                    "Only a PENDING_APPROVAL issue can be approved (current: " + status + ")");
        }
        this.status = IssueStatus.APPROVED;
        this.approvedByUserId = approverId;
        this.approvedAt = Instant.now();
    }

    public void reject(UUID approverId) {
        if (status != IssueStatus.PENDING_APPROVAL) {
            throw new BusinessRuleException("STORE_ISSUE_NOT_PENDING",
                    "Only a PENDING_APPROVAL issue can be rejected (current: " + status + ")");
        }
        this.status = IssueStatus.REJECTED;
        this.approvedByUserId = approverId;
        this.approvedAt = Instant.now();
    }

    /** Marks the issue as physically issued. Guards state and emptiness. */
    public void markIssued() {
        if (status != IssueStatus.APPROVED) {
            throw new BusinessRuleException("STORE_ISSUE_NOT_APPROVED",
                    "Only an APPROVED issue can be issued (current: " + status + ")");
        }
        if (lines.isEmpty()) {
            throw new BusinessRuleException("STORE_ISSUE_EMPTY", "Cannot issue with no lines");
        }
        this.status = IssueStatus.ISSUED;
        this.issuedAt = Instant.now();
    }

    public void markReturned() {
        this.status = IssueStatus.RETURNED;
    }
}
