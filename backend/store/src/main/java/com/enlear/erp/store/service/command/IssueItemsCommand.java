package com.enlear.erp.store.service.command;

import java.util.List;
import java.util.UUID;

/**
 * Intent to physically issue an approved document, specifying the storage slots
 * each line is drawn from (with a count per slot) so location stock can be
 * reduced. A line may be split across several slots; the counts for a line must
 * sum to its approved quantity.
 */
public record IssueItemsCommand(
        UUID issueId,
        List<LineLocation> allocations) {

    public record LineLocation(UUID lineId, String rack, String row, String column,
                               java.math.BigDecimal quantity) {
    }
}
