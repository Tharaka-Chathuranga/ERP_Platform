package com.enlear.erp.store.service;

import com.enlear.erp.shared.error.BusinessRuleException;
import com.enlear.erp.shared.error.ResourceNotFoundException;
import com.enlear.erp.store.service.command.PostStockMovementCommand;
import com.enlear.erp.store.repository.ItemRepository;
import com.enlear.erp.store.repository.StockMovementRepository;
import com.enlear.erp.store.exposed.event.StockMovementRecordedEvent;
import com.enlear.erp.store.model.Item;
import com.enlear.erp.store.model.StockMovement;
import java.math.BigDecimal;
import java.util.UUID;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
public class StockService {

    private final ItemRepository items;
    private final StockMovementRepository movements;
    private final ApplicationEventPublisher events;

    public StockService(ItemRepository items, StockMovementRepository movements,
                        ApplicationEventPublisher events) {
        this.items = items;
        this.movements = movements;
        this.events = events;
    }

    public StockMovement postMovement(PostStockMovementCommand cmd) {
        validateQuantity(cmd.quantity());

        // Write-lock the item so concurrent movements adjust on-hand serially.
        Item item = items.findByIdForUpdate(cmd.itemId())
                .orElseThrow(() -> new ResourceNotFoundException("Item", cmd.itemId()));
        if (!item.isActive()) {
            throw new BusinessRuleException("STORE_ITEM_INACTIVE",
                    "Cannot post stock for inactive item " + item.getItemCode());
        }

        StockMovement movement = new StockMovement(cmd.itemId(), cmd.type(), cmd.quantity(),
                cmd.unitCost(), cmd.reference(), cmd.occurredAt());

        item.adjustOnHand(movement.signedQuantity());
        if (cmd.location() != null) {
            item.applyLocationDelta(cmd.location(), movement.signedQuantity());
        }

        StockMovement saved = movements.save(movement);

        events.publishEvent(new StockMovementRecordedEvent(
                saved.getId(), saved.getItemId(), saved.getType(),
                saved.getQuantity(), item.getQuantityOnHand(), saved.getOccurredAt()));

        return saved;
    }

    @Transactional(readOnly = true)
    public BigDecimal getOnHand(UUID itemId) {
        return items.findById(itemId)
                .map(Item::getQuantityOnHand)
                .orElseThrow(() -> new ResourceNotFoundException("Item", itemId));
    }

    @Transactional(readOnly = true)
    public Page<StockMovement> getMovementsForItem(UUID itemId, Pageable pageable) {
        return movements.findByItemIdOrderByOccurredAtDesc(itemId, pageable);
    }

    private void validateQuantity(BigDecimal quantity) {
        if (quantity == null || quantity.signum() <= 0) {
            throw new BusinessRuleException("STORE_INVALID_QUANTITY",
                    "Quantity must be a positive number");
        }
    }
}
