package com.enlear.erp.store.service.agent.llm;

import org.springframework.boot.context.properties.ConfigurationProperties;

/**
 * Configuration for the LLM-backed Stock Management Agent. Only consulted when
 * {@code erp.store.agent.mode=llm}. The API key must come from the environment
 * ({@code ANTHROPIC_API_KEY}) — never hardcoded.
 *
 * @param provider  which LLM provider to use ({@code anthropic}; {@code ollama} later)
 * @param model     model id, e.g. {@code claude-opus-4-8}
 * @param apiKey    provider API key (from env)
 * @param maxTokens output cap for a drafted notification
 */
@ConfigurationProperties(prefix = "erp.store.agent.llm")
public record LlmAgentProperties(String provider, String model, String apiKey, Integer maxTokens) {

    public LlmAgentProperties {
        if (provider == null || provider.isBlank()) {
            provider = "anthropic";
        }
        if (model == null || model.isBlank()) {
            model = "claude-opus-4-8";
        }
        if (maxTokens == null || maxTokens <= 0) {
            maxTokens = 1024;
        }
    }
}
