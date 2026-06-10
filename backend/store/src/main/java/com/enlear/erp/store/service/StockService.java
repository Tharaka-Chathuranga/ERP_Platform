package com.enlear.erp.store.service;

import com.enlear.erp.shared.error.BusinessRuleException;
import com.enlear.erp.shared.error.ResourceNotFoundException;
import com.enlear.erp.store.service.command.PostStockMovementCommand;
import com.enlear.erp.store.repository.ItemRepository;
import com.enlear.erp.store.repository.StockMovementRepository;
import com.enlear.erp.store.api.event.StockMovementRecordedEvent;
import com.enlear.erp.store.domain.Item;
import com.enlear.erp.store.domain.MovementType;
import com.enlear.erp.store.domain.StockMovement;
import java.math.BigDecimal;
import java.util.Arrays;
import java.util.List;
import java.util.UUID;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Core inventory use case: posts immutable {@link StockMovement} entries to the
 * append-only ledger. On-hand quantity is DERIVED by summing the signed ledger
 * (the {@code stock_levels} projection was removed) — there is no separate
 * on-hand row to maintain.
 */
@Service
@Transactional
public class StockService {

    /** Movement types that increase on-hand stock, used by the derived sum. */
    private static final List<MovementType> INBOUND = Arrays.stream(MovementType.values())
            .filter(MovementType::isInbound)
            .toList();

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

        Item item = items.findById(cmd.itemId())
                .orElseThrow(() -> new ResourceNotFoundException("Item", cmd.itemId()));
        if (!item.isActive()) {
            throw new BusinessRuleException("STORE_ITEM_INACTIVE",
                    "Cannot post stock for inactive item " + item.getItemCode());
        }

        // On-hand is derived from the ledger. The non-negative check below is
        // best-effort without row locking (single-store, low-concurrency model)
        // since the stock_levels projection was removed.
        BigDecimal current = movements.sumOnHand(cmd.itemId(), INBOUND);

        StockMovement movement = new StockMovement(cmd.itemId(), cmd.type(), cmd.quantity(),
                cmd.unitCost(), cmd.reference(), cmd.occurredAt());

        BigDecimal newOnHand = current.add(movement.signedQuantity());
        if (newOnHand.signum() < 0) {
            throw new BusinessRuleException("STORE_INSUFFICIENT_STOCK",
                    "Insufficient stock: on hand %s, requested change %s"
                            .formatted(current, movement.signedQuantity()));
        }

        StockMovement saved = movements.save(movement);

        events.publishEvent(new StockMovementRecordedEvent(
                saved.getId(), saved.getItemId(), saved.getType(),
                saved.getQuantity(), newOnHand, saved.getOccurredAt()));

        return saved;
    }

    /** Current on-hand quantity for an item, derived from the movement ledger. */
    @Transactional(readOnly = true)
    public BigDecimal getOnHand(UUID itemId) {
        return movements.sumOnHand(itemId, INBOUND);
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
