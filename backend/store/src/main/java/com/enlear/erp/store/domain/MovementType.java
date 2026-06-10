package com.enlear.erp.store.domain;

/**
 * The kind of stock movement. The {@code direction} determines whether the
 * movement increases (+1) or decreases (-1) on-hand quantity, keeping the
 * sign logic in one place rather than scattered across services.
 */
public enum MovementType {

    RECEIPT(1),        // goods received into a warehouse (e.g. purchase, return-in)
    ISSUE(-1),         // goods issued out (e.g. sale, consumption)
    ADJUSTMENT_IN(1),  // positive stock-take correction
    ADJUSTMENT_OUT(-1),// negative stock-take correction (damage, loss)
    TRANSFER_IN(1),    // received side of an inter-warehouse transfer
    TRANSFER_OUT(-1);  // sent side of an inter-warehouse transfer

    private final int direction;

    MovementType(int direction) {
        this.direction = direction;
    }

    public int direction() {
        return direction;
    }

    public boolean isInbound() {
        return direction > 0;
    }
}
