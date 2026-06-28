import type { CommandDef, MatchResult } from "../types";
import type { IntentResolutionStrategy } from "./IntentResolutionStrategy";

/**
 * Runs resolution strategies in priority order and returns the first match.
 * Default chain is rule-based only; an LLM fallback can be appended without any
 * caller change.
 */
export class IntentResolver {
  constructor(private readonly strategies: readonly IntentResolutionStrategy[]) {}

  async resolve(
    transcript: string,
    commands: readonly CommandDef[],
  ): Promise<MatchResult | null> {
    for (const strategy of this.strategies) {
      const result = await strategy.resolve(transcript, commands);
      if (result) return result;
    }
    return null;
  }
}
