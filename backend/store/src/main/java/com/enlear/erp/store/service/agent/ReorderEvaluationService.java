package com.enlear.erp.store.service.agent;

import com.enlear.erp.notification.exposed.NotificationApi;
import com.enlear.erp.store.exposed.event.StockMovementRecordedEvent;
import com.enlear.erp.store.model.Item;
import com.enlear.erp.store.model.ReorderAlert;
import com.enlear.erp.store.model.ReorderAlertStatus;
import com.enlear.erp.store.model.Supplier;
import com.enlear.erp.store.model.SupplierItem;
import com.enlear.erp.store.model.SupplierStatus;
import com.enlear.erp.store.repository.ItemRepository;
import com.enlear.erp.store.repository.ReorderAlertRepository;
import com.enlear.erp.store.repository.SupplierItemRepository;
import com.enlear.erp.store.repository.SupplierRepository;
import com.enlear.erp.store.service.agent.ReorderAssessment.SupplierOption;
import java.math.BigDecimal;
import java.time.Instant;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.function.Function;
import java.util.stream.Collectors;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.transaction.event.TransactionalEventListener;

/**
 * Reacts to committed stock movements and drives the reorder workflow: when an
 * item falls to or below its reorder level it opens a {@link ReorderAlert},
 * assembles the sourcing picture, asks the {@link StockManagementAgent} for the
 * admin message and raises it through {@link NotificationApi}. When stock later
 * recovers, the open alert is resolved so a future dip can alert again.
 *
 * <p>The listener runs {@code AFTER_COMMIT} in its own transaction, so alerts
 * only ever reflect durably-committed stock and never fire on a rolled-back
 * movement.
 */
@Service
public class ReorderEvaluationService {

    private static final Logger log = LoggerFactory.getLogger(ReorderEvaluationService.class);

    private final ItemRepository items;
    private final SupplierItemRepository supplierItems;
    private final SupplierRepository suppliers;
    private final ReorderAlertRepository alerts;
    private final StockManagementAgent agent;
    private final NotificationApi notifications;
    private final StockAgentProperties properties;

    public ReorderEvaluationService(ItemRepository items, SupplierItemRepository supplierItems,
                                    SupplierRepository suppliers, ReorderAlertRepository alerts,
                                    StockManagementAgent agent, NotificationApi notifications,
                                    StockAgentProperties properties) {
        this.items = items;
        this.supplierItems = supplierItems;
        this.suppliers = suppliers;
        this.alerts = alerts;
        this.agent = agent;
        this.notifications = notifications;
        this.properties = properties;
    }

    @TransactionalEventListener(phase = org.springframework.transaction.event.TransactionPhase.AFTER_COMMIT)
    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void onStockMovement(StockMovementRecordedEvent event) {
        if (!properties.enabled()) {
            return;
        }
        try {
            evaluate(event.itemId());
        } catch (RuntimeException ex) {
            // Never let a notification failure break stock recording (already committed).
            log.error("Reorder evaluation failed for item {}", event.itemId(), ex);
        }
    }

    private void evaluate(UUID itemId) {
        Item item = items.findById(itemId).orElse(null);
        if (item == null) {
            return;
        }

        boolean belowReorder = item.getQuantityOnHand().compareTo(item.getReorderLevel()) <= 0;
        if (!belowReorder) {
            resolveOpenAlert(itemId);
            return;
        }

        // Idempotent: a partial unique index also guards this at the DB level.
        if (alerts.existsByItemIdAndStatus(itemId, ReorderAlertStatus.OPEN)) {
            return;
        }

        ReorderAlert alert = new ReorderAlert(item.getId(), item.getItemCode(),
                item.getQuantityOnHand(), item.getReorderLevel());
        try {
            alert = alerts.save(alert);
        } catch (DataIntegrityViolationException raced) {
            // A concurrent movement opened the alert first — nothing more to do.
            return;
        }

        ReorderAssessment assessment = buildAssessment(item);
        AgentOutcome outcome = agent.handle(assessment);
        UUID notificationId = notifications.raise(outcome.toRequest(assessment));
        alert.linkNotification(notificationId);

        log.info("Reorder alert raised for item {} (on-hand {} <= reorder {})",
                item.getItemCode(), item.getQuantityOnHand(), item.getReorderLevel());
    }

    private void resolveOpenAlert(UUID itemId) {
        alerts.findByItemIdAndStatus(itemId, ReorderAlertStatus.OPEN)
                .ifPresent(alert -> alert.resolve(Instant.now()));
    }

    private ReorderAssessment buildAssessment(Item item) {
        List<SupplierItem> links = supplierItems.findByItemId(item.getId());

        Map<UUID, Supplier> byId = suppliers.findAllById(
                        links.stream().map(SupplierItem::getSupplierId).toList()).stream()
                .collect(Collectors.toMap(Supplier::getId, Function.identity()));

        List<SupplierOption> options = links.stream()
                .map(link -> toOption(link, byId.get(link.getSupplierId())))
                .filter(java.util.Objects::nonNull)
                .sorted(Comparator
                        .comparing(SupplierOption::leadTimeDays,
                                Comparator.nullsLast(Comparator.naturalOrder()))
                        .thenComparing(SupplierOption::lastPurchasePrice,
                                Comparator.nullsLast(Comparator.naturalOrder())))
                .toList();

        BigDecimal shortfall = item.getReorderLevel().subtract(item.getQuantityOnHand()).max(BigDecimal.ZERO);

        return new ReorderAssessment(item.getId(), item.getItemCode(), item.getName(),
                item.getQuantityOnHand(), item.getReorderLevel(), shortfall,
                item.isCriticalItem(), options);
    }

    /** Map a supplier link to a sourcing option, skipping unknown/inactive suppliers. */
    private static SupplierOption toOption(SupplierItem link, Supplier supplier) {
        if (supplier == null || supplier.getStatus() != SupplierStatus.ACTIVE) {
            return null;
        }
        return new SupplierOption(supplier.getId(), supplier.getCode(), supplier.getName(),
                link.getLeadTimeDays(), link.getLastPurchasePrice());
    }
}
