/**
 * Converts spoken English number words into digits, e.g. "forty two" → 42.
 * English-only by requirement, so a compact lookup covers the practical range
 * (0–999,999) used for quantities, litres and readings.
 */

const SMALL_NUMBERS: Record<string, number> = {
  zero: 0, oh: 0,
  one: 1, two: 2, three: 3, four: 4, five: 5, six: 6, seven: 7, eight: 8, nine: 9,
  ten: 10, eleven: 11, twelve: 12, thirteen: 13, fourteen: 14, fifteen: 15,
  sixteen: 16, seventeen: 17, eighteen: 18, nineteen: 19,
  twenty: 20, thirty: 30, forty: 40, fifty: 50, sixty: 60, seventy: 70, eighty: 80, ninety: 90,
};

const MULTIPLIERS: Record<string, number> = {
  hundred: 100,
  thousand: 1000,
  million: 1_000_000,
};

const FILLER_WORDS = new Set(["and"]);

function isNumberWord(token: string): boolean {
  return token in SMALL_NUMBERS || token in MULTIPLIERS || FILLER_WORDS.has(token);
}

/**
 * Parses a run of number words into a single number. Returns null when the run
 * contains no recognised number words.
 */
export function parseSpokenNumber(words: string): number | null {
  const tokens = words.trim().toLowerCase().split(/\s+/).filter(Boolean);
  if (tokens.length === 0) return null;

  let total = 0;
  let current = 0;
  let sawNumber = false;

  for (const token of tokens) {
    if (FILLER_WORDS.has(token)) continue;

    if (token in SMALL_NUMBERS) {
      current += SMALL_NUMBERS[token];
      sawNumber = true;
    } else if (token === "hundred") {
      current = (current || 1) * 100;
      sawNumber = true;
    } else if (token in MULTIPLIERS) {
      total += (current || 1) * MULTIPLIERS[token];
      current = 0;
      sawNumber = true;
    } else {
      return null; // non-number token — not a pure number phrase
    }
  }

  return sawNumber ? total + current : null;
}

/**
 * Replaces every contiguous run of number words inside a transcript with its
 * digit form, leaving the rest of the text intact. Already-digit numbers pass
 * through untouched.
 */
export function replaceNumberWords(text: string): string {
  const tokens = text.split(/\s+/);
  const output: string[] = [];
  let run: string[] = [];

  const flushRun = () => {
    if (run.length === 0) return;
    const value = parseSpokenNumber(run.join(" "));
    output.push(value === null ? run.join(" ") : String(value));
    run = [];
  };

  for (const token of tokens) {
    if (isNumberWord(token.toLowerCase())) {
      run.push(token);
    } else {
      flushRun();
      output.push(token);
    }
  }
  flushRun();

  return output.join(" ");
}
