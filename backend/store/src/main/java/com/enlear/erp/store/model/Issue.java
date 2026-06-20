package com.enlear.erp.store.model;

import com.enlear.erp.shared.model.BaseEntity;
import com.enlear.erp.shared.error.BusinessRuleException;
import com.enlear.erp.shared.error.ResourceNotFoundException;
import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import java.math.BigDecimal;
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

    public Issue(String issueNumber, UUID borrowingUserId, UUID storeKeeperId) {
        this.issueNumber = issueNumber;
        this.borrowingUserId = borrowingUserId;
        this.storeKeeperId = storeKeeperId;
        this.status = IssueStatus.DRAFT;
    }

    public void addLine(IssueLine line) {
        lines.add(line);
    }

    public void recomputeStatus() {
        if (status == IssueStatus.ISSUED || status == IssueStatus.RETURNED) {
            return;
        }
        boolean anyPending = lines.stream().anyMatch(IssueLine::isPending);
        boolean anyApproved = lines.stream().anyMatch(IssueLine::isApproved);
        if (anyPending) {
            this.status = IssueStatus.PENDING_APPROVAL;
        } else if (anyApproved) {
            this.status = IssueStatus.APPROVED;
        } else {
            this.status = IssueStatus.REJECTED;
        }
    }

    public void decideLine(UUID lineId, boolean approve, BigDecimal approvedQuantity, UUID approverId) {
        IssueLine line = lines.stream()
                .filter(l -> l.getId().equals(lineId))
                .findFirst()
                .orElseThrow(() -> new ResourceNotFoundException("IssueLine", lineId));
        if (approve) {
            line.approve(approverId, approvedQuantity);
        } else {
            line.reject(approverId);
        }
        recordDecision(approverId);
    }

    /** Approves every still-pending line (whole-document "approve all"). */
    public void approve(UUID approverId) {
        requirePending();
        lines.stream().filter(IssueLine::isPending).forEach(l -> l.approve(approverId));
        recordDecision(approverId);
    }

    /** Rejects every still-pending line (whole-document "reject all"). */
    public void reject(UUID approverId) {
        requirePending();
        lines.stream().filter(IssueLine::isPending).forEach(l -> l.reject(approverId));
        recordDecision(approverId);
    }

    private void requirePending() {
        if (status != IssueStatus.PENDING_APPROVAL) {
            throw new BusinessRuleException("STORE_ISSUE_NOT_PENDING",
                    "Only a PENDING_APPROVAL issue can be decided (current: " + status + ")");
        }
    }

    private void recordDecision(UUID approverId) {
        this.approvedByUserId = approverId;
        this.approvedAt = Instant.now();
        recomputeStatus();
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
