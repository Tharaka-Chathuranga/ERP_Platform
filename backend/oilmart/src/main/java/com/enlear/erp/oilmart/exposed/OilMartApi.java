package com.enlear.erp.oilmart.exposed;

import com.enlear.erp.oilmart.exposed.dto.OilMartSalesSummary;
import com.enlear.erp.oilmart.exposed.dto.OilMartStockSummary;

public interface OilMartApi {

    OilMartStockSummary stockSummary();

    OilMartSalesSummary salesSummary();
}
