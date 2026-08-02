package com.enlear.erp.oilmart.service.stock;

import com.enlear.erp.oilmart.model.OilMartItem;
import com.enlear.erp.oilmart.model.OilMartItemStore;
import com.enlear.erp.oilmart.model.OilMartMovementReferenceType;
import com.enlear.erp.oilmart.model.OilMartMovementType;
import com.enlear.erp.oilmart.model.OilMartStockMovement;
import com.enlear.erp.oilmart.repository.OilMartItemRepository;
import com.enlear.erp.oilmart.repository.OilMartItemStoreRepository;
import com.enlear.erp.oilmart.repository.OilMartStockMovementRepository;
import com.enlear.erp.shared.error.ResourceNotFoundException;
import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

@Service
public class OilMartStockService {

    private final OilMartItemStoreRepository balances;
    private final OilMartStockMovementRepository movements;
    private final OilMartItemRepository items;

    public OilMartStockService(OilMartItemStoreRepository balances,
                               OilMartStockMovementRepository movements,
                               OilMartItemRepository items) {
        this.balances = balances;
        this.movements = movements;
        this.items = items;
    }

    @Transactional(propagation = Propagation.MANDATORY)
    public OilMartStockMovement apply(UUID itemId,
                                      BigDecimal quantityDelta,
                                      OilMartMovementType movementType,
                                      OilMartMovementReferenceType referenceType,
                                      UUID referenceId,
                                      String referenceNo,
                                      UUID movedByUserId,
                                      String note) {
        OilMartItem item = items.findById(itemId)
                .orElseThrow(() -> new ResourceNotFoundException("OilMartItem", itemId));

        OilMartItemStore balance = balances.findByItemIdForUpdate(itemId)
                .orElseGet(() -> balances.save(new OilMartItemStore(itemId)));

        BigDecimal balanceAfter = balance.applyDelta(quantityDelta, item.getName());
        balances.save(balance);

        return movements.save(new OilMartStockMovement(itemId, movementType, quantityDelta,
                balanceAfter, referenceType, referenceId, referenceNo, movedByUserId, note));
    }

    @Transactional(readOnly = true)
    public List<OilMartItemStore> balances() {
        return balances.findAll();
    }

    @Transactional(readOnly = true)
    public BigDecimal onHand(UUID itemId) {
        return balances.findByItemId(itemId)
                .map(OilMartItemStore::getQuantityOnHand)
                .orElse(BigDecimal.ZERO);
    }

    @Transactional(readOnly = true)
    public List<OilMartStockMovement> movements(UUID itemId) {
        return movements.findByItemIdOrderByMovedAtDesc(itemId);
    }

    @Transactional(readOnly = true)
    public List<OilMartStockMovement> movementsForReference(UUID referenceId) {
        return movements.findByReferenceIdOrderByMovedAtAsc(referenceId);
    }
}
