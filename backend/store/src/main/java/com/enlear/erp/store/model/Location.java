package com.enlear.erp.store.model;

import java.math.BigDecimal;

public record Location(String rack, String row, String column, boolean primary, boolean general,
                       BigDecimal quantity) {

    public Location(String rack, String row, String column, boolean primary, BigDecimal quantity) {
        this(rack, row, column, primary, false, quantity);
    }


    public static Location general(BigDecimal quantity) {
        return new Location(null, null, null, false, true, quantity);
    }

    public boolean isGeneral() {
        return general;
    }
}
