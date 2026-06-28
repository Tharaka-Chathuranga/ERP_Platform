import { describe, expect, it } from "vitest";
import { parseSpokenNumber, replaceNumberWords } from "../transcript/numberWords";

describe("parseSpokenNumber", () => {
  it("parses tens and units", () => {
    expect(parseSpokenNumber("forty two")).toBe(42);
    expect(parseSpokenNumber("seven")).toBe(7);
    expect(parseSpokenNumber("nineteen")).toBe(19);
  });

  it("parses hundreds and thousands", () => {
    expect(parseSpokenNumber("two hundred")).toBe(200);
    expect(parseSpokenNumber("one thousand five hundred")).toBe(1500);
    expect(parseSpokenNumber("three hundred and twenty one")).toBe(321);
  });

  it("returns null for non-number phrases", () => {
    expect(parseSpokenNumber("go to fuel")).toBeNull();
    expect(parseSpokenNumber("")).toBeNull();
  });
});

describe("replaceNumberWords", () => {
  it("substitutes embedded number runs only", () => {
    expect(replaceNumberWords("issue forty two litres")).toBe("issue 42 litres");
    expect(replaceNumberWords("set quantity to one hundred")).toBe("set quantity to 100");
  });

  it("leaves non-number words untouched", () => {
    expect(replaceNumberWords("go to suppliers")).toBe("go to suppliers");
  });
});
