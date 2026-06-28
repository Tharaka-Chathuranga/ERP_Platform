import { normalizeTranscript } from "../intent/transcript/normalizeTranscript";

/**
 * Classifies a spoken reply while a mutating command awaits confirmation.
 *
 * Single responsibility: classify a transcript as confirm / cancel / neither.
 */

export const CONFIRM_WORDS = ["yes", "confirm", "okay", "ok", "correct", "do it"];
export const CANCEL_WORDS = ["no", "cancel", "stop", "abort", "never mind"];

export type ConfirmationAnswer = "confirm" | "cancel" | null;

export function interpretConfirmation(transcript: string): ConfirmationAnswer {
  const text = normalizeTranscript(transcript);
  if (!text) return null;
  if (CONFIRM_WORDS.some((word) => text === word || text.includes(word))) return "confirm";
  if (CANCEL_WORDS.some((word) => text === word || text.includes(word))) return "cancel";
  return null;
}
