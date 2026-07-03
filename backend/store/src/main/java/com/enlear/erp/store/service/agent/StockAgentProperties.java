package com.enlear.erp.store.service.agent;

import org.springframework.boot.context.properties.ConfigurationProperties;

/**
 * Configuration for the Stock Management Agent.
 *
 * @param enabled master switch for the reorder-evaluation listener
 * @param mode    which agent implementation is active: {@code rule-based} (no
 *                LLM, the default) or {@code llm} (future LangChain4j agent)
 */
@ConfigurationProperties(prefix = "erp.store.agent")
public record StockAgentProperties(boolean enabled, String mode) {

    public StockAgentProperties {
        if (mode == null || mode.isBlank()) {
            mode = "rule-based";
        }
    }
}
