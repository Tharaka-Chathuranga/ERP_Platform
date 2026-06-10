package com.enlear.erp.store.web.dto;

import com.enlear.erp.store.domain.Item;
import com.enlear.erp.store.domain.ItemStatus;
import com.enlear.erp.store.domain.Location;
import com.enlear.erp.store.domain.MovementType;
import com.enlear.erp.store.domain.StockMovement;
import com.enlear.erp.store.domain.ValuationMethod;
import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;
import java.util.UUID;

/**
 * Outbound API representations and the mapping from domain models. Grouped in
 * one file to keep the read-side DTOs together; mapping is explicit (no
 * reflection) so the API contract is stable and obvious.
 */
public final class StoreResponses {

    private StoreResponses() {
    }

    public record ItemResponse(
            UUID id, String sku, String name, String description, String unitOfMeasure,
            BigDecimal unitPrice, String category, ValuationMethod valuationMethod,
            BigDecimal reorderLevel, boolean criticalItem, boolean approvalRequiredForIssue,
            List<Location> locations, ItemStatus status) {

        public static ItemResponse from(Item i) {
            return new ItemResponse(i.getId(), i.getSku(), i.getName(), i.getDescription(),
                    i.getUnitOfMeasure(), i.getUnitPrice(), i.getCategory(), i.getValuationMethod(),
                    i.getReorderLevel(), i.isCriticalItem(), i.isApprovalRequiredForIssue(),
                    i.getLocations(), i.getStatus());
        }
    }

    public record OnHandResponse(UUID itemId, BigDecimal quantityOnHand) {

        public static OnHandResponse of(UUID itemId, BigDecimal quantityOnHand) {
            return new OnHandResponse(itemId, quantityOnHand);
        }
    }

    public record StockMovementResponse(
            UUID id, UUID itemId, MovementType type, BigDecimal quantity,
            BigDecimal unitCost, String reference, Instant occurredAt) {

        public static StockMovementResponse from(StockMovement m) {
            return new StockMovementResponse(m.getId(), m.getItemId(),
                    m.getType(), m.getQuantity(), m.getUnitCost(), m.getReference(),
                    m.getOccurredAt());
        }
    }
}
