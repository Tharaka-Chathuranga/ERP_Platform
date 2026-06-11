package com.enlear.erp.store.service;

import com.enlear.erp.shared.error.BusinessRuleException;
import com.enlear.erp.shared.error.ResourceNotFoundException;
import com.enlear.erp.store.domain.Issue;
import com.enlear.erp.store.domain.IssueLine;
import com.enlear.erp.store.domain.Item;
import com.enlear.erp.store.domain.MovementType;
import com.enlear.erp.store.repository.ItemRepository;
import com.enlear.erp.store.repository.IssueRepository;
import com.enlear.erp.store.service.command.CreateIssueCommand;
import com.enlear.erp.store.service.command.PostStockMovementCommand;
import com.enlear.erp.store.service.command.ReturnItemsCommand;
import java.time.Instant;
import java.util.UUID;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Issuing / borrowing of stock. An issue needing approval (any line whose item
 * is {@code approvalRequiredForIssue}) starts PENDING_APPROVAL; otherwise it is
 * auto-APPROVED. Issuing writes ISSUE movements; returning writes RECEIPT moves.
 */
@Service
@Transactional
public class IssueService {

    private final IssueRepository issues;
    private final ItemRepository items;
    private final StockService stock;

    public IssueService(IssueRepository issues,
                        ItemRepository items, StockService stock) {
        this.issues = issues;
        this.items = items;
        this.stock = stock;
    }

    public Issue createIssue(CreateIssueCommand cmd) {
        if (cmd.lines() == null || cmd.lines().isEmpty()) {
            throw new BusinessRuleException("STORE_ISSUE_EMPTY",
                    "An issue must have at least one line");
        }

        boolean requiresApproval = false;
        for (CreateIssueCommand.Line line : cmd.lines()) {
            Item item = items.findById(line.itemId())
                    .orElseThrow(() -> new ResourceNotFoundException("Item", line.itemId()));
            if (item.isApprovalRequiredForIssue()) {
                requiresApproval = true;
            }
        }

        Issue issue = new Issue(generateIssueNumber(), cmd.borrowingUserId(),
                cmd.storeKeeperId(), requiresApproval);
        for (CreateIssueCommand.Line line : cmd.lines()) {
            issue.addLine(new IssueLine(line.itemId(), line.quantity(), line.returnable()));
        }
        return issues.save(issue);
    }

    public Issue approve(UUID id, UUID approverId) {
        Issue issue = getIssue(id);
        issue.approve(approverId);
        return issues.save(issue);
    }

    public Issue reject(UUID id, UUID approverId) {
        Issue issue = getIssue(id);
        issue.reject(approverId);
        return issues.save(issue);
    }

    /** Posts ISSUE movements for an APPROVED issue and marks it ISSUED. */
    public Issue issue(UUID id) {
        Issue issue = getIssue(id);
        issue.markIssued();
        for (IssueLine line : issue.getLines()) {
            stock.postMovement(new PostStockMovementCommand(
                    line.getItemId(), MovementType.ISSUE,
                    line.getQuantity(), null, issue.getIssueNumber(),
                    Instant.now()));
        }
        return issues.save(issue);
    }

    /** Records returns of returnable lines, writing RECEIPT movements back in. */
    public Issue returnItems(ReturnItemsCommand cmd) {
        Issue issue = getIssue(cmd.issueId());
        if (issue.getStatus() != com.enlear.erp.store.domain.IssueStatus.ISSUED
                && issue.getStatus() != com.enlear.erp.store.domain.IssueStatus.RETURNED) {
            throw new BusinessRuleException("STORE_ISSUE_NOT_ISSUED",
                    "Only an ISSUED document can have returns");
        }
        for (ReturnItemsCommand.Line ret : cmd.lines()) {
            IssueLine line = issue.getLines().stream()
                    .filter(l -> l.getItemId().equals(ret.itemId()))
                    .findFirst()
                    .orElseThrow(() -> new ResourceNotFoundException("IssueLine", ret.itemId()));
            line.recordReturn(ret.quantity());
            stock.postMovement(new PostStockMovementCommand(
                    line.getItemId(), MovementType.RECEIPT,
                    ret.quantity(), null, issue.getIssueNumber(),
                    Instant.now()));
        }
        boolean allReturned = issue.getLines().stream()
                .allMatch(l -> l.getReturnedQuantity().compareTo(l.getQuantity()) >= 0);
        if (allReturned) {
            issue.markReturned();
        }
        return issues.save(issue);
    }

    @Transactional(readOnly = true)
    public Issue getIssue(UUID id) {
        return issues.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Issue", id));
    }

    @Transactional(readOnly = true)
    public Page<Issue> listForUser(UUID borrowingUserId, Pageable pageable) {
        return issues.findByBorrowingUserIdOrderByCreatedAtDesc(borrowingUserId, pageable);
    }

    /** Issues filtered by status, or all issues when {@code status} is null. */
    @Transactional(readOnly = true)
    public Page<Issue> list(com.enlear.erp.store.domain.IssueStatus status, Pageable pageable) {
        return status == null
                ? issues.findAllByOrderByCreatedAtDesc(pageable)
                : issues.findByStatusOrderByCreatedAtDesc(status, pageable);
    }

    private String generateIssueNumber() {
        return "ISS-" + Instant.now().toEpochMilli();
    }
}
