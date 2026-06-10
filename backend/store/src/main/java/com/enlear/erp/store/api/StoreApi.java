package com.enlear.erp.store.api;

import com.enlear.erp.store.api.dto.StockLevelView;
import java.util.UUID;

/**
 * Public, cross-module entry point for the store module. Other modules
 * (e.g. accounting, sales) depend ONLY on this interface and the DTOs/events
 * published under {@code com.enlear.erp.store.api} — never on store's
 * {@code web}, {@code service}, {@code domain} or {@code repository} internals.
 */
public interface StoreApi {

    /** Current on-hand quantity for an item, derived from the movement ledger. */
    StockLevelView stockOnHand(UUID itemId);
}
