package com.enlear.erp.store.service.issue;

import com.enlear.erp.store.model.Issue;
import com.enlear.erp.store.model.IssueLine;
import com.enlear.erp.store.model.Item;
import com.enlear.erp.store.repository.ItemRepository;
import com.enlear.erp.store.service.command.CreateIssueCommand;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;
import org.springframework.stereotype.Component;

@Component
class IssueFactory {

    private final ItemRepository items;
    private final IssueNumberGenerator numbers;

    IssueFactory(ItemRepository items, IssueNumberGenerator numbers) {
        this.items = items;
        this.numbers = numbers;
    }

    Issue build(CreateIssueCommand cmd) {
        Map<UUID, Boolean> approvalRequired = items.findAllById(
                cmd.lines().stream().map(CreateIssueCommand.Line::itemId).toList()).stream()
                .collect(Collectors.toMap(Item::getId, Item::isApprovalRequiredForIssue));

        Issue issue = new Issue(numbers.issueNumber(), cmd.borrowingUserId(), cmd.storeKeeperId());
        for (CreateIssueCommand.Line line : cmd.lines()) {
            issue.addLine(new IssueLine(line.itemId(), line.quantity(), line.returnable(),
                    approvalRequired.getOrDefault(line.itemId(), false)));
        }
        issue.recomputeStatus();
        return issue;
    }
}
