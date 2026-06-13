package com.enlear.erp.store.service;

import com.enlear.erp.shared.error.BusinessRuleException;
import com.enlear.erp.shared.error.ResourceNotFoundException;
import com.enlear.erp.store.model.Issue;
import com.enlear.erp.store.model.IssueLine;
import com.enlear.erp.store.model.Item;
import com.enlear.erp.store.model.MovementType;
import com.enlear.erp.store.repository.ItemRepository;
import com.enlear.erp.store.repository.IssueRepository;
import com.enlear.erp.store.service.command.CreateIssueCommand;
import com.enlear.erp.store.service.command.DecideIssueLinesCommand;
import com.enlear.erp.store.service.command.PostStockMovementCommand;
import com.enlear.erp.store.service.command.ReturnItemsCommand;
import java.time.Instant;
import java.util.UUID;
import org.hibernate.Hibernate;
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

        Issue issue = new Issue(generateIssueNumber(), cmd.borrowingUserId(),
                cmd.storeKeeperId());
        for (CreateIssueCommand.Line line : cmd.lines()) {
            Item item = items.findById(line.itemId())
                    .orElseThrow(() -> new ResourceNotFoundException("Item", line.itemId()));
            issue.addLine(new IssueLine(line.itemId(), line.quantity(), line.returnable(),
                    item.isApprovalRequiredForIssue()));
        }
        issue.recomputeStatus();
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

    /** Approves/rejects individual lines, then re-derives the document status. */
    public Issue decideLines(DecideIssueLinesCommand cmd) {
        Issue issue = getIssue(cmd.issueId());
        for (DecideIssueLinesCommand.Decision d : cmd.decisions()) {
            issue.decideLine(d.lineId(), d.approve(), cmd.approverId());
        }
        return issues.save(issue);
    }

    /** Posts ISSUE movements for the APPROVED lines of an issue and marks it ISSUED. */
    public Issue issue(UUID id) {
        Issue issue = getIssue(id);
        issue.markIssued();
        for (IssueLine line : issue.getLines()) {
            if (!line.isApproved()) {
                continue; // rejected lines never leave the store
            }
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
        if (issue.getStatus() != com.enlear.erp.store.model.IssueStatus.ISSUED
                && issue.getStatus() != com.enlear.erp.store.model.IssueStatus.RETURNED) {
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
        Issue issue = issues.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Issue", id));
        Hibernate.initialize(issue.getLines());
        return issue;
    }

    @Transactional(readOnly = true)
    public Page<Issue> listForUser(UUID borrowingUserId, Pageable pageable) {
        return withLines(issues.findByBorrowingUserIdOrderByCreatedAtDesc(borrowingUserId, pageable));
    }

    /** Issues filtered by status, or all issues when {@code status} is null. */
    @Transactional(readOnly = true)
    public Page<Issue> list(com.enlear.erp.store.model.IssueStatus status, Pageable pageable) {
        return withLines(status == null
                ? issues.findAllByOrderByCreatedAtDesc(pageable)
                : issues.findByStatusOrderByCreatedAtDesc(status, pageable));
    }

    private Page<Issue> withLines(Page<Issue> page) {
        page.forEach(issue -> Hibernate.initialize(issue.getLines()));
        return page;
    }

    private String generateIssueNumber() {
        return "ISS-" + Instant.now().toEpochMilli();
    }
}
