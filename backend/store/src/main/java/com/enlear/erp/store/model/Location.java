package com.enlear.erp.store.model;

import java.math.BigDecimal;

/**
 * A storage slot for an item and the quantity currently held there. Stock is
 * tracked per slot: receiving adds into the matching slot (or creates one) and
 * issuing draws from a chosen slot, removing it once it reaches zero.
 */
public record Location(String rack, String row, String column, boolean primary, BigDecimal quantity) {
}
