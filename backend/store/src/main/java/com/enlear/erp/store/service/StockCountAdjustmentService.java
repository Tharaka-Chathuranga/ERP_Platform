package com.enlear.erp.store.service;

import com.enlear.erp.shared.error.ResourceNotFoundException;
import com.enlear.erp.store.model.CountAdjustmentStatus;
import com.enlear.erp.store.model.Item;
import com.enlear.erp.store.model.MovementType;
import com.enlear.erp.store.model.StockCountAdjustmentRequest;
import com.enlear.erp.store.repository.ItemRepository;
import com.enlear.erp.store.repository.StockCountAdjustmentRequestRepository;
import com.enlear.erp.store.service.command.CreateCountAdjustmentCommand;
import com.enlear.erp.store.service.command.PostStockMovementCommand;
import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;
import java.util.UUID;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Workflow for count-adjustment requests. Requests are raised against an item's
 * current on-hand and only mutate stock on approval, at which point the
 * reconciling movement is posted through {@link StockService} so the immutable
 * ledger stays authoritative. Rejection leaves stock untouched.
 */
@Service
@Transactional
public class StockCountAdjustmentService {

    private final StockCountAdjustmentRequestRepository requests;
    private final ItemRepository items;
    private final StockService stockService;

    public StockCountAdjustmentService(StockCountAdjustmentRequestRepository requests,
                                       ItemRepository items, StockService stockService) {
        this.requests = requests;
        this.items = items;
        this.stockService = stockService;
    }

    public StockCountAdjustmentRequest create(CreateCountAdjustmentCommand cmd) {
        Item item = items.findById(cmd.itemId())
                .orElseThrow(() -> new ResourceNotFoundException("Item", cmd.itemId()));
        StockCountAdjustmentRequest request = new StockCountAdjustmentRequest(
                cmd.itemId(), item.getQuantityOnHand(), cmd.requestedQuantity(),
                cmd.reason(), cmd.requestedByUserId());
        return requests.save(request);
    }

    /**
     * Approve the request and reconcile on-hand to the requested quantity. The
     * delta is computed against live on-hand (not the request-time snapshot) so
     * concurrent movements between request and approval are not double-counted.
     * A zero delta approves without posting a movement.
     */
    public StockCountAdjustmentRequest approve(UUID id, UUID approverId) {
        StockCountAdjustmentRequest request = get(id);
        request.approve(approverId);

        BigDecimal delta = request.getRequestedQuantity().subtract(stockService.getOnHand(request.getItemId()));
        if (delta.signum() != 0) {
            MovementType type = delta.signum() > 0 ? MovementType.ADJUSTMENT_IN : MovementType.ADJUSTMENT_OUT;
            stockService.postMovement(new PostStockMovementCommand(
                    request.getItemId(), type, delta.abs(), null,
                    "Count adjustment " + request.getId(), Instant.now()));
        }
        return requests.save(request);
    }

    public StockCountAdjustmentRequest reject(UUID id, UUID approverId) {
        StockCountAdjustmentRequest request = get(id);
        request.reject(approverId);
        return requests.save(request);
    }

    @Transactional(readOnly = true)
    public StockCountAdjustmentRequest get(UUID id) {
        return requests.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("StockCountAdjustmentRequest", id));
    }

    @Transactional(readOnly = true)
    public List<StockCountAdjustmentRequest> list(CountAdjustmentStatus status) {
        return status == null
                ? requests.findAllByOrderByRequestedAtDesc()
                : requests.findByStatusOrderByRequestedAtDesc(status);
    }
}
