package com.enlear.erp.oilmart.exposed.dto;

import java.math.BigDecimal;

public record OilMartSalesSummary(
        BigDecimal salesThisPeriod, long saleCountThisPeriod, long awaitingApproval) {
}
