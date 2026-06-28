import type { CommandDef, MatchResult } from "../types";
import { IntentMatcher } from "../matching/IntentMatcher";
import type { IntentResolutionStrategy } from "./IntentResolutionStrategy";

/**
 * Primary strategy: the deterministic, offline rule engine. Instant and
 * predictable — the only path allowed to resolve mutating commands.
 */
export class RuleBasedStrategy implements IntentResolutionStrategy {
  readonly id = "rule-based";

  constructor(private readonly matcher: IntentMatcher = new IntentMatcher()) {}

  resolve(transcript: string, commands: readonly CommandDef[]): Promise<MatchResult | null> {
    return Promise.resolve(this.matcher.match(transcript, commands));
  }
}
