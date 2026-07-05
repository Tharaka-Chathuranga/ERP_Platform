// store ── inventory / warehouse management. The first business module.
// Depends on shared, plus the notification module's public API (to raise
// reorder alerts through NotificationApi — its exposed facade only).

dependencies {
    implementation(project(":shared"))
    implementation(project(":notification"))

    // Stock Management Agent — LLM drafting via LangChain4j (Claude + future Ollama).
    // Only exercised when erp.store.agent.mode=llm; the rule-based agent needs none of this.
    val langchain4j = property("langchain4jVersion")
    implementation("dev.langchain4j:langchain4j:$langchain4j")
    implementation("dev.langchain4j:langchain4j-anthropic:$langchain4j")
}
