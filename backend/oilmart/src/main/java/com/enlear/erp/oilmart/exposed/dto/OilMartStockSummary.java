package com.enlear.erp.oilmart.exposed.dto;

import java.math.BigDecimal;

public record OilMartStockSummary(BigDecimal stockValue, long itemCount, long lowStockCount) {
}
