package com.enlear.erp.store.service.agent;


public interface StockManagementAgent {

    AgentOutcome handle(ReorderAssessment assessment);
}
