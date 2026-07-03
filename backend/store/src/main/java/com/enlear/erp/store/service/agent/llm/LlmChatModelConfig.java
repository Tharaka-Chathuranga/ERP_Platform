package com.enlear.erp.store.service.agent.llm;

import com.enlear.erp.shared.error.BusinessRuleException;
import dev.langchain4j.model.anthropic.AnthropicChatModel;
import dev.langchain4j.model.chat.ChatModel;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/**
 * Builds the {@link ChatModel} the LLM agent talks to. Only active when
 * {@code erp.store.agent.mode=llm}, so the rule-based path never needs a model,
 * an API key or a network call. Provider selection ({@code anthropic} today,
 * {@code ollama} later) is a config switch — the rest of the agent is unaware.
 */
@Configuration
@ConditionalOnProperty(name = "erp.store.agent.mode", havingValue = "llm")
public class LlmChatModelConfig {

    @Bean
    public ChatModel reorderChatModel(LlmAgentProperties props) {
        if (!"anthropic".equalsIgnoreCase(props.provider())) {
            throw new BusinessRuleException("STORE_AGENT_UNSUPPORTED_PROVIDER",
                    "Unsupported LLM provider: " + props.provider());
        }
        if (props.apiKey() == null || props.apiKey().isBlank()) {
            throw new BusinessRuleException("STORE_AGENT_MISSING_API_KEY",
                    "erp.store.agent.mode=llm requires ANTHROPIC_API_KEY to be set");
        }
        return AnthropicChatModel.builder()
                .apiKey(props.apiKey())
                .modelName(props.model())
                .maxTokens(props.maxTokens())
                .build();
    }
}
