import type { CommandDef, MatchResult } from "../types";
import { normalizeTranscript } from "../transcript/normalizeTranscript";
import { stripFillers } from "../transcript/stripFillers";
import { compilePattern } from "./PatternCompiler";
import { extractSlots } from "./SlotExtractor";
import { similarity } from "./fuzzyMatch";

/**
 * The rule engine: resolves a transcript to a command + slots.
 *
 * Tolerant by design, because real speech is messy:
 *  1. Exact — every command/pattern is compiled to an anchored regex and tested
 *     against both the raw and filler-stripped transcript (score 1.0). Most
 *     specific literal match wins.
 *  2. Fuzzy fallback (slotless commands) — the command phrase is compared against
 *     every same-length window of the utterance, so it still matches when buried
 *     in extra words ("could you please go to tanks"). Small ASR slips are
 *     absorbed by edit-distance similarity.
 *
 * Slot-bearing commands still require an exact literal match of their fixed
 * words, keeping data-entry mappings predictable; the confirmation gate guards
 * the rest.
 */
export class IntentMatcher {
  private readonly fuzzyThreshold: number;

  constructor(options: { fuzzyThreshold?: number } = {}) {
    this.fuzzyThreshold = options.fuzzyThreshold ?? 0.74;
  }

  match(transcript: string, commands: readonly CommandDef[]): MatchResult | null {
    const text = normalizeTranscript(transcript);
    if (!text) return null;
    const stripped = stripFillers(text);

    return (
      this.matchExact(text, commands) ??
      (stripped && stripped !== text ? this.matchExact(stripped, commands) : null) ??
      this.matchFuzzy(stripped || text, commands)
    );
  }

  private matchExact(text: string, commands: readonly CommandDef[]): MatchResult | null {
    let best: { result: MatchResult; specificity: number } | null = null;

    for (const command of commands) {
      const slots = command.slots ?? [];
      for (const pattern of command.patterns) {
        const compiled = compilePattern(pattern, slots);
        const match = compiled.regex.exec(text);
        if (!match) continue;

        const result: MatchResult = {
          commandId: command.id,
          slots: extractSlots(match.groups ?? {}, slots),
          score: 1,
        };
        if (!best || compiled.literalWordCount > best.specificity) {
          best = { result, specificity: compiled.literalWordCount };
        }
      }
    }
    return best?.result ?? null;
  }

  private matchFuzzy(text: string, commands: readonly CommandDef[]): MatchResult | null {
    const tokens = text.split(/\s+/).filter(Boolean);
    let best: MatchResult | null = null;

    for (const command of commands) {
      if (command.slots && command.slots.length > 0) continue;
      for (const pattern of command.patterns) {
        const score = this.bestWindowSimilarity(tokens, normalizeTranscript(pattern));
        if (score < this.fuzzyThreshold) continue;
        if (!best || score > best.score) {
          best = { commandId: command.id, slots: {}, score };
        }
      }
    }
    return best;
  }

  /** Best similarity of `phrase` against any same-length window of the tokens. */
  private bestWindowSimilarity(tokens: readonly string[], phrase: string): number {
    const phraseTokens = phrase.split(/\s+/).filter(Boolean);
    const windowSize = phraseTokens.length;
    if (windowSize === 0) return 0;
    if (tokens.length <= windowSize) return similarity(tokens.join(" "), phrase);

    let best = 0;
    for (let start = 0; start + windowSize <= tokens.length; start += 1) {
      const window = tokens.slice(start, start + windowSize).join(" ");
      best = Math.max(best, similarity(window, phrase));
      if (best === 1) break;
    }
    return best;
  }
}
