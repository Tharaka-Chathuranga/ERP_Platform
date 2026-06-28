import type { SlotDef } from "../types";

/**
 * Compiles a single utterance pattern (e.g. "set quantity to {qty}") into an
 * anchored regular expression with one named capture group per slot. The group's
 * inner expression is chosen from the slot type so capture is type-aware.
 *
 * Single responsibility: pattern string + slot defs → CompiledPattern. No
 * matching, scoring or extraction happens here.
 */

export interface CompiledPattern {
  readonly regex: RegExp;
  readonly slotNames: readonly string[];
  /** Count of literal (non-slot) words — used to break ties toward specificity. */
  readonly literalWordCount: number;
}

const PLACEHOLDER = /\{(\w+)\}/g;

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/** Whitespace in literal text becomes a flexible `\s+` matcher. */
function compileLiteral(literal: string): string {
  return escapeRegExp(literal.trim()).replace(/\\?\s+/g, "\\s+");
}

function compileSlotBody(slot: SlotDef | undefined): string {
  if (!slot) return ".+?";
  switch (slot.type) {
    case "number":
      return "\\d+(?:\\.\\d+)?";
    case "enum":
    case "dynamic": {
      const values = (slot.values?.() ?? []).filter(Boolean);
      if (values.length === 0) return ".+?";
      // Longest first so "purchase order" wins over "order".
      const alternatives = [...values]
        .sort((a, b) => b.length - a.length)
        .map((value) => compileLiteral(value));
      return `(?:${alternatives.join("|")})`;
    }
    case "text":
    default:
      return ".+?";
  }
}

export function compilePattern(
  pattern: string,
  slots: readonly SlotDef[] = [],
): CompiledPattern {
  const slotByName = new Map(slots.map((slot) => [slot.name, slot]));
  const slotNames: string[] = [];

  let regexBody = "";
  let lastIndex = 0;
  let literalWordCount = 0;

  for (const match of pattern.matchAll(PLACEHOLDER)) {
    const [token, slotName] = match;
    const literal = pattern.slice(lastIndex, match.index);
    if (literal.trim()) {
      literalWordCount += literal.trim().split(/\s+/).length;
      regexBody += compileLiteral(literal);
      if (/\s$/.test(literal)) regexBody += "\\s*";
    }
    regexBody += `(?<${slotName}>${compileSlotBody(slotByName.get(slotName))})`;
    slotNames.push(slotName);
    lastIndex = (match.index ?? 0) + token.length;
  }

  const trailing = pattern.slice(lastIndex);
  if (trailing.trim()) {
    literalWordCount += trailing.trim().split(/\s+/).length;
    if (/^\s/.test(trailing)) regexBody += "\\s*";
    regexBody += compileLiteral(trailing);
  }

  return {
    regex: new RegExp(`^${regexBody}$`, "i"),
    slotNames,
    literalWordCount,
  };
}
