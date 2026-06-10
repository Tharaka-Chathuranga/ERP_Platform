package com.enlear.erp.store.service;

import com.enlear.erp.store.api.StoreApi;
import com.enlear.erp.store.api.dto.StockLevelView;
import java.util.List;
import java.util.UUID;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Implements the public {@link StoreApi} facade by delegating to the module's
 * internal services. This bean is the single seam other modules wire against,
 * keeping store's internals encapsulated.
 */
@Service
@Transactional(readOnly = true)
public class StoreApiService implements StoreApi {

    private final StockService stock;

    public StoreApiService(StockService stock) {
        this.stock = stock;
    }

    @Override
    public List<StockLevelView> stockLevelsForItem(UUID itemId) {
        return stock.getStockLevelsForItem(itemId).stream()
                .map(s -> new StockLevelView(s.getItemId(), s.getWarehouseId(), s.getQuantityOnHand()))
                .toList();
    }
}
