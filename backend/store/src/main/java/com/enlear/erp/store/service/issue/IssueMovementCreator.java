package com.enlear.erp.store.service.issue;

import com.enlear.erp.shared.error.BusinessRuleException;
import com.enlear.erp.store.model.Issue;
import com.enlear.erp.store.model.IssueLine;
import com.enlear.erp.store.model.Location;
import com.enlear.erp.store.model.MovementType;
import com.enlear.erp.store.service.StockService;
import com.enlear.erp.store.service.command.IssueItemsCommand;
import com.enlear.erp.store.service.command.PostStockMovementCommand;
import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;
import org.springframework.stereotype.Component;

@Component
class IssueMovementCreator {

    private final StockService stock;

    IssueMovementCreator(StockService stock) {
        this.stock = stock;
    }

    void postIssue(Issue issue, List<IssueItemsCommand.LineLocation> allocations) {
        Map<java.util.UUID, List<IssueItemsCommand.LineLocation>> byLine = allocations.stream()
                .collect(Collectors.groupingBy(IssueItemsCommand.LineLocation::lineId));

        for (IssueLine line : issue.getLines()) {
            if (!line.isApproved()) {
                continue;
            }
            List<IssueItemsCommand.LineLocation> slots = byLine.get(line.getId());
            if (slots == null || slots.isEmpty()) {
                throw new BusinessRuleException("STORE_ISSUE_NO_LOCATION",
                        "No source location given for issued item " + line.getItemId());
            }
            BigDecimal allocated = slots.stream()
                    .map(IssueItemsCommand.LineLocation::quantity)
                    .reduce(BigDecimal.ZERO, BigDecimal::add);
            if (allocated.compareTo(line.getQuantity()) != 0) {
                throw new BusinessRuleException("STORE_ISSUE_LOCATION_MISMATCH",
                        "Location counts (%s) must total the issued quantity (%s)"
                                .formatted(allocated, line.getQuantity()));
            }
            for (IssueItemsCommand.LineLocation slot : slots) {
                stock.postMovement(new PostStockMovementCommand(line.getItemId(), MovementType.ISSUE,
                        slot.quantity(), null, issue.getIssueNumber(), Instant.now(), slotOf(slot)));
            }
        }
    }

    void postReturn(Issue issue, IssueLine line, BigDecimal quantity) {
        stock.postMovement(new PostStockMovementCommand(line.getItemId(), MovementType.RECEIPT,
                quantity, null, issue.getIssueNumber(), Instant.now(), Location.general(quantity)));
    }

    private static Location slotOf(IssueItemsCommand.LineLocation slot) {
        boolean hasSlot = isPresent(slot.rack()) || isPresent(slot.row()) || isPresent(slot.column());
        return hasSlot ? new Location(slot.rack(), slot.row(), slot.column(), false, null)
                : Location.general(null);
    }

    private static boolean isPresent(String value) {
        return value != null && !value.isBlank();
    }
}
