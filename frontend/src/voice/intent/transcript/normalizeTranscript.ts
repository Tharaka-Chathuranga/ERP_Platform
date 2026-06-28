import { replaceNumberWords } from "./numberWords";

/**
 * Normalises a raw transcript into a canonical form the matcher can compare
 * against: lower-cased, punctuation-free, single-spaced, with spoken numbers
 * turned into digits. One responsibility — text cleanup only; no matching here.
 */
export function normalizeTranscript(raw: string): string {
  const lowered = raw.toLowerCase();
  // Replace any punctuation (keep letters, digits, whitespace) with a space.
  const depunctuated = lowered.replace(/[^\p{L}\p{N}\s]/gu, " ");
  const collapsed = depunctuated.replace(/\s+/g, " ").trim();
  return replaceNumberWords(collapsed);
}
