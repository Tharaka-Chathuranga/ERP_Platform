/**
 * Removes conversational filler from the edges of a transcript so command
 * matching isn't defeated by natural speech ("okay, go to tanks please" →
 * "go to tanks"). Only leading/trailing fillers are removed — never words in
 * the middle — so slot values stay intact.
 */

const LEADING_FILLERS = new Set([
  "hey", "hi", "hello", "ok", "okay", "um", "uh", "er", "so", "well", "now",
  "please", "assistant", "computer", "yo", "alright",
]);

const TRAILING_FILLERS = new Set(["please", "now", "thanks", "thank", "you"]);

// Multi-word lead-ins stripped as a whole, e.g. "can you go to tanks".
const LEADING_PHRASES = [
  "can you", "could you", "would you", "will you",
  "i want to", "i would like to", "i need to", "i'd like to",
  "let's", "lets", "go ahead and", "please can you",
];

export function stripFillers(text: string): string {
  let result = text.trim();

  let changed = true;
  while (changed) {
    changed = false;
    for (const phrase of LEADING_PHRASES) {
      if (result === phrase) return "";
      if (result.startsWith(`${phrase} `)) {
        result = result.slice(phrase.length + 1);
        changed = true;
      }
    }
  }

  let tokens = result.split(/\s+/).filter(Boolean);
  while (tokens.length > 1 && LEADING_FILLERS.has(tokens[0])) tokens.shift();
  while (tokens.length > 1 && TRAILING_FILLERS.has(tokens[tokens.length - 1])) tokens.pop();

  return tokens.join(" ");
}
