package com.enlear.erp.oilmart.model;

import java.math.BigDecimal;

public enum OilMartStockAdjustmentDirection {

    IN {
        @Override
        public BigDecimal signedDelta(BigDecimal quantityLitres) {
            return quantityLitres;
        }
    },

    OUT {
        @Override
        public BigDecimal signedDelta(BigDecimal quantityLitres) {
            return quantityLitres.negate();
        }
    };

    public abstract BigDecimal signedDelta(BigDecimal quantityLitres);
}
