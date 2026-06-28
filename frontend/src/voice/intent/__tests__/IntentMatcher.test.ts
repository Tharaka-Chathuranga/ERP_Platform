import { describe, expect, it } from "vitest";
import { IntentMatcher } from "../matching/IntentMatcher";
import type { CommandDef } from "../types";

const noop = () => {};

const commands: CommandDef[] = [
  {
    id: "nav.fuel.issues",
    title: "Vehicle Issues",
    patterns: ["go to vehicle issues", "open vehicle issues"],
    handler: noop,
  },
  {
    id: "fuel.issue.set-litres",
    title: "Set litres",
    patterns: ["issue {litres} litres", "set litres to {litres}"],
    slots: [{ name: "litres", type: "number" }],
    mutating: true,
    handler: noop,
  },
  {
    id: "store.item.search",
    title: "Search item",
    patterns: ["search {item}"],
    slots: [
      { name: "item", type: "dynamic", values: () => ["diesel", "engine oil", "widget a"] },
    ],
    handler: noop,
  },
];

describe("IntentMatcher", () => {
  const matcher = new IntentMatcher();

  it("matches a slotless navigation command exactly", () => {
    const result = matcher.match("go to vehicle issues", commands);
    expect(result?.commandId).toBe("nav.fuel.issues");
    expect(result?.score).toBe(1);
  });

  it("extracts a numeric slot, including spoken numbers", () => {
    const result = matcher.match("issue forty two litres", commands);
    expect(result?.commandId).toBe("fuel.issue.set-litres");
    expect(result?.slots.litres).toBe(42);
  });

  it("snaps a dynamic slot to the nearest known value", () => {
    const result = matcher.match("search diesel", commands);
    expect(result?.commandId).toBe("store.item.search");
    expect(result?.slots.item).toBe("diesel");
  });

  it("falls back to fuzzy matching for slotless commands", () => {
    const result = matcher.match("go to vehicle issue", commands); // missing trailing s
    expect(result?.commandId).toBe("nav.fuel.issues");
    expect(result && result.score).toBeGreaterThan(0.8);
  });

  it("matches a navigation command buried in filler words", () => {
    const result = matcher.match("could you please go to vehicle issues now", commands);
    expect(result?.commandId).toBe("nav.fuel.issues");
  });

  it("strips leading/trailing filler around a slot command", () => {
    const result = matcher.match("okay issue forty two litres please", commands);
    expect(result?.commandId).toBe("fuel.issue.set-litres");
    expect(result?.slots.litres).toBe(42);
  });

  it("returns null when nothing is close", () => {
    expect(matcher.match("make me a sandwich", commands)).toBeNull();
  });
});
