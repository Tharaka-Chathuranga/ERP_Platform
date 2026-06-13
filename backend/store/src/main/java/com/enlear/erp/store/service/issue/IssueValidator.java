package com.enlear.erp.store.service.issue;

import com.enlear.erp.shared.error.BusinessRuleException;
import com.enlear.erp.shared.error.ResourceNotFoundException;
import com.enlear.erp.store.repository.ItemRepository;
import com.enlear.erp.store.service.command.CreateIssueCommand;
import java.util.HashSet;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;
import org.springframework.stereotype.Component;

@Component
class IssueValidator {

    private final ItemRepository items;

    IssueValidator(ItemRepository items) {
        this.items = items;
    }

    void validate(CreateIssueCommand cmd) {
        validateHasLines(cmd);
        validateItemsExist(cmd);
    }

    private void validateHasLines(CreateIssueCommand cmd) {
        if (cmd.lines() == null || cmd.lines().isEmpty()) {
            throw new BusinessRuleException("STORE_ISSUE_EMPTY",
                    "An issue must have at least one line");
        }
    }

    private void validateItemsExist(CreateIssueCommand cmd) {
        Set<UUID> requestedItemIds = cmd.lines().stream()
                .map(CreateIssueCommand.Line::itemId)
                .collect(Collectors.toSet());
        Set<UUID> existingItemIds = new HashSet<>(items.findExistingIds(requestedItemIds));
        for (CreateIssueCommand.Line line : cmd.lines()) {
            if (!existingItemIds.contains(line.itemId())) {
                throw new ResourceNotFoundException("Item", line.itemId());
            }
        }
    }
}
