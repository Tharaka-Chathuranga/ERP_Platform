package com.enlear.erp.store.api;

import com.enlear.erp.store.api.dto.StockLevelView;
import java.util.List;
import java.util.UUID;

/**
 * Public, cross-module entry point for the store module. Other modules
 * (e.g. accounting, sales) depend ONLY on this interface and the DTOs/events
 * published under {@code com.enlear.erp.store.api} — never on store's
 * {@code web}, {@code service}, {@code domain} or {@code repository} internals.
 */
public interface StoreApi {

    /** Current on-hand quantities for an item across all warehouses. */
    List<StockLevelView> stockLevelsForItem(UUID itemId);
}
