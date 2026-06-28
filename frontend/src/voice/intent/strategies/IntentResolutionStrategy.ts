import type { CommandDef, MatchResult } from "../types";

/**
 * A pluggable way to turn a transcript into a command match. Strategies are
 * tried in order by the resolver chain; the first non-null result wins.
 *
 * This is the seam that lets an Ollama-backed NLU fallback slot in behind the
 * deterministic rule engine without changing any caller.
 */
export interface IntentResolutionStrategy {
  readonly id: string;
  resolve(
    transcript: string,
    commands: readonly CommandDef[],
  ): Promise<MatchResult | null>;
}
