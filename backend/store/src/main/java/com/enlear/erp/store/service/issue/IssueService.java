package com.enlear.erp.store.service.issue;

import com.enlear.erp.shared.error.BusinessRuleException;
import com.enlear.erp.shared.error.ResourceNotFoundException;
import com.enlear.erp.store.model.Issue;
import com.enlear.erp.store.model.IssueLine;
import com.enlear.erp.store.model.IssueStatus;
import com.enlear.erp.store.repository.IssueRepository;
import com.enlear.erp.store.service.command.CreateIssueCommand;
import com.enlear.erp.store.service.command.DecideIssueLinesCommand;
import com.enlear.erp.store.service.command.ReturnItemsCommand;
import java.util.UUID;
import org.hibernate.Hibernate;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
public class IssueService {

    private final IssueRepository issues;
    private final IssueValidator validator;
    private final IssueFactory factory;
    private final IssueMovementCreator movements;

    public IssueService(IssueRepository issues, IssueValidator validator,
                        IssueFactory factory, IssueMovementCreator movements) {
        this.issues = issues;
        this.validator = validator;
        this.factory = factory;
        this.movements = movements;
    }

    public Issue createIssue(CreateIssueCommand cmd) {
        validator.validate(cmd);
        Issue issue = factory.build(cmd);
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
            issue.decideLine(d.lineId(), d.approve(), d.approvedQuantity(), cmd.approverId());
        }
        return issues.save(issue);
    }

    /** Posts ISSUE movements for the APPROVED lines of an issue and marks it ISSUED. */
    public Issue issue(UUID id) {
        Issue issue = getIssue(id);
        issue.markIssued();
        movements.postIssue(issue);
        return issues.save(issue);
    }

    /** Records returns of returnable lines, writing RECEIPT movements back in. */
    public Issue returnItems(ReturnItemsCommand cmd) {
        Issue issue = getIssue(cmd.issueId());
        if (issue.getStatus() != IssueStatus.ISSUED && issue.getStatus() != IssueStatus.RETURNED) {
            throw new BusinessRuleException("STORE_ISSUE_NOT_ISSUED",
                    "Only an ISSUED document can have returns");
        }
        for (ReturnItemsCommand.Line ret : cmd.lines()) {
            IssueLine line = issue.getLines().stream()
                    .filter(l -> l.getItemId().equals(ret.itemId()))
                    .findFirst()
                    .orElseThrow(() -> new ResourceNotFoundException("IssueLine", ret.itemId()));
            line.recordReturn(ret.quantity());
            movements.postReturn(issue, line, ret.quantity());
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
    public Page<Issue> list(IssueStatus status, Pageable pageable) {
        return withLines(status == null
                ? issues.findAllByOrderByCreatedAtDesc(pageable)
                : issues.findByStatusOrderByCreatedAtDesc(status, pageable));
    }

    private Page<Issue> withLines(Page<Issue> page) {
        page.forEach(issue -> Hibernate.initialize(issue.getLines()));
        return page;
    }
}
