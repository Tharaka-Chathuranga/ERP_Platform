import type { SlotDef, SlotValue } from "../types";
import { bestMatch } from "./fuzzyMatch";

/**
 * Coerces the raw string captured by a pattern's named groups into typed slot
 * values. Single responsibility: capture groups → typed values.
 */
export function extractSlots(
  rawGroups: Record<string, string | undefined>,
  slots: readonly SlotDef[],
): Record<string, SlotValue> {
  const result: Record<string, SlotValue> = {};
  const slotByName = new Map(slots.map((slot) => [slot.name, slot]));

  for (const [name, rawValue] of Object.entries(rawGroups)) {
    if (rawValue === undefined) continue;
    const raw = rawValue.trim();
    const slot = slotByName.get(name);

    if (slot?.type === "number") {
      const parsed = Number.parseFloat(raw);
      if (!Number.isNaN(parsed)) result[name] = parsed;
      continue;
    }

    if (slot?.type === "enum" || slot?.type === "dynamic") {
      // Snap to the nearest allowed value so "widget ay" → "Widget A".
      const candidates = slot.values?.() ?? [];
      const match = bestMatch(raw, candidates, 0.6);
      result[name] = match?.value ?? raw;
      continue;
    }

    result[name] = raw;
  }

  return result;
}
