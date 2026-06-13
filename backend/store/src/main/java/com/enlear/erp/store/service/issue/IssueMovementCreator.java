package com.enlear.erp.store.service.issue;

import com.enlear.erp.store.model.Issue;
import com.enlear.erp.store.model.IssueLine;
import com.enlear.erp.store.model.MovementType;
import com.enlear.erp.store.service.StockService;
import com.enlear.erp.store.service.command.PostStockMovementCommand;
import java.math.BigDecimal;
import java.time.Instant;
import org.springframework.stereotype.Component;

@Component
class IssueMovementCreator {

    private final StockService stock;

    IssueMovementCreator(StockService stock) {
        this.stock = stock;
    }

    /** Posts ISSUE movements for every approved line — rejected lines never leave the store. */
    void postIssue(Issue issue) {
        for (IssueLine line : issue.getLines()) {
            if (!line.isApproved()) {
                continue;
            }
            stock.postMovement(new PostStockMovementCommand(line.getItemId(), MovementType.ISSUE,
                    line.getQuantity(), null, issue.getIssueNumber(), Instant.now()));
        }
    }

    /** Posts a RECEIPT movement returning a quantity of a line back into the store. */
    void postReturn(Issue issue, IssueLine line, BigDecimal quantity) {
        stock.postMovement(new PostStockMovementCommand(line.getItemId(), MovementType.RECEIPT,
                quantity, null, issue.getIssueNumber(), Instant.now()));
    }
}
