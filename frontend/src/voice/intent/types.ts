import type { QueryClient } from "@tanstack/react-query";
import type { Permission } from "@auth/permissions";

/**
 * Core vocabulary of the rule-based intent layer. These types are deliberately
 * free of React and engine concerns so the matcher stays a pure, testable unit.
 */

/** The kinds of value a command can capture from a spoken phrase. */
export type SlotType = "number" | "enum" | "dynamic" | "text";

/** A coerced slot value handed to a command handler. */
export type SlotValue = string | number;

export interface SlotDef {
  /** Placeholder name as it appears in a pattern, e.g. `qty` in "set quantity to {qty}". */
  readonly name: string;
  readonly type: SlotType;
  /**
   * Allowed values for `enum` (static) and `dynamic` (resolved at registration
   * time from live data, e.g. on-screen item or vehicle names). Unused for
   * `number` and `text`.
   */
  readonly values?: () => string[];
}

/** Everything a command handler needs to act, injected by the VoiceProvider. */
export interface CommandContext {
  readonly navigate: (path: string) => void;
  readonly can: (permission: Permission) => boolean;
  readonly speak: (text: string) => void;
  readonly queryClient: QueryClient;
}

export interface CommandDef {
  /** Stable unique id, e.g. "nav.fuel.issues" or "fuel.issue.create". */
  readonly id: string;
  /** Short human title for the help overlay. */
  readonly title: string;
  /**
   * Utterance templates with `{slot}` placeholders, e.g.
   * ["go to {page}"], ["set quantity to {qty}", "quantity {qty}"].
   */
  readonly patterns: readonly string[];
  readonly slots?: readonly SlotDef[];
  /** When set, the command is only offered to users holding this permission. */
  readonly requiredPermission?: Permission;
  /** Mutating commands go through the confirmation gate before executing. */
  readonly mutating?: boolean;
  /** Executes the command. May be async (e.g. a react-query mutation). */
  readonly handler: (slots: Readonly<Record<string, SlotValue>>, context: CommandContext) => void | Promise<void>;
  /** Human read-back used by the confirmation gate, e.g. (s) => `Issue ${s.litres} litres`. */
  readonly describe?: (slots: Readonly<Record<string, SlotValue>>) => string;
}

/** A successful resolution of a transcript to a command. */
export interface MatchResult {
  readonly commandId: string;
  readonly slots: Readonly<Record<string, SlotValue>>;
  /** Match quality in 0..1 (1 = exact). */
  readonly score: number;
}
