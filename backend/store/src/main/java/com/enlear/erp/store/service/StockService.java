package com.enlear.erp.store.service;

import com.enlear.erp.shared.error.BusinessRuleException;
import com.enlear.erp.shared.error.ResourceNotFoundException;
import com.enlear.erp.store.service.command.PostStockMovementCommand;
import com.enlear.erp.store.repository.ItemRepository;
import com.enlear.erp.store.repository.StockLevelRepository;
import com.enlear.erp.store.repository.StockMovementRepository;
import com.enlear.erp.store.repository.WarehouseRepository;
import com.enlear.erp.store.api.event.StockMovementRecordedEvent;
import com.enlear.erp.store.domain.Item;
import com.enlear.erp.store.domain.StockLevel;
import com.enlear.erp.store.domain.StockMovement;
import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Core inventory use case: posts immutable {@link StockMovement} entries and
 * maintains the derived {@link StockLevel} projection in the SAME transaction,
 * so the ledger and the on-hand quantity can never drift apart.
 *
 * <p>Concurrency: the stock-level row is locked with {@code SELECT … FOR UPDATE}
 * so simultaneous movements on the same item/warehouse are serialised, making
 * the "stock may not go negative" invariant safe under load.
 */
@Service
@Transactional
public class StockService {

    private final ItemRepository items;
    private final WarehouseRepository warehouses;
    private final StockMovementRepository movements;
    private final StockLevelRepository stockLevels;
    private final ApplicationEventPublisher events;

    public StockService(ItemRepository items, WarehouseRepository warehouses,
                        StockMovementRepository movements, StockLevelRepository stockLevels,
                        ApplicationEventPublisher events) {
        this.items = items;
        this.warehouses = warehouses;
        this.movements = movements;
        this.stockLevels = stockLevels;
        this.events = events;
    }

    public StockMovement postMovement(PostStockMovementCommand cmd) {
        validateQuantity(cmd.quantity());

        Item item = items.findById(cmd.itemId())
                .orElseThrow(() -> new ResourceNotFoundException("Item", cmd.itemId()));
        if (!item.isActive()) {
            throw new BusinessRuleException("STORE_ITEM_INACTIVE",
                    "Cannot post stock for inactive item " + item.getSku());
        }
        warehouses.findById(cmd.warehouseId())
                .orElseThrow(() -> new ResourceNotFoundException("Warehouse", cmd.warehouseId()));

        // Lock (or create) the stock level for this item/warehouse.
        StockLevel level = stockLevels.findForUpdate(cmd.itemId(), cmd.warehouseId())
                .orElseGet(() -> stockLevels.save(new StockLevel(cmd.itemId(), cmd.warehouseId())));

        // Record the immutable ledger entry.
        StockMovement movement = new StockMovement(cmd.itemId(), cmd.warehouseId(), cmd.type(),
                cmd.quantity(), cmd.unitCost(), cmd.reference(), cmd.note(), cmd.occurredAt());

        // Apply the signed delta — enforces the non-negative-stock invariant.
        level.apply(movement.signedQuantity());

        StockMovement saved = movements.save(movement);
        stockLevels.save(level);

        events.publishEvent(new StockMovementRecordedEvent(
                saved.getId(), saved.getItemId(), saved.getWarehouseId(), saved.getType(),
                saved.getQuantity(), level.getQuantityOnHand(), saved.getOccurredAt()));

        return saved;
    }

    @Transactional(readOnly = true)
    public List<StockLevel> getStockLevelsForItem(UUID itemId) {
        return stockLevels.findByItemId(itemId);
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
