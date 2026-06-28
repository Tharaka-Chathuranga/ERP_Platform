/**
 * Dependency-free fuzzy string scoring used to recover from small ASR glitches
 * (word boundaries, plurals, near-homophones). Pure functions only.
 */

/** Classic Levenshtein edit distance. */
export function levenshtein(a: string, b: string): number {
  if (a === b) return 0;
  if (a.length === 0) return b.length;
  if (b.length === 0) return a.length;

  let previous = Array.from({ length: b.length + 1 }, (_, i) => i);
  let current = new Array<number>(b.length + 1);

  for (let i = 1; i <= a.length; i += 1) {
    current[0] = i;
    for (let j = 1; j <= b.length; j += 1) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      current[j] = Math.min(
        current[j - 1] + 1, // insertion
        previous[j] + 1, // deletion
        previous[j - 1] + cost, // substitution
      );
    }
    [previous, current] = [current, previous];
  }
  return previous[b.length];
}

/** Sorts whitespace tokens so word order does not affect comparison. */
function tokenSort(value: string): string {
  return value.split(/\s+/).filter(Boolean).sort().join(" ");
}

/**
 * Token-sorted, length-normalised similarity in 0..1 (1 = identical). Robust to
 * reordered words and minor spelling differences.
 */
export function similarity(a: string, b: string): number {
  const left = tokenSort(a);
  const right = tokenSort(b);
  if (left === right) return 1;
  const longest = Math.max(left.length, right.length);
  if (longest === 0) return 1;
  return 1 - levenshtein(left, right) / longest;
}

/** Returns the best-scoring candidate against `query`, or null below `threshold`. */
export function bestMatch(
  query: string,
  candidates: readonly string[],
  threshold = 0.8,
): { value: string; score: number } | null {
  let best: { value: string; score: number } | null = null;
  for (const candidate of candidates) {
    const score = similarity(query, candidate);
    if (!best || score > best.score) best = { value: candidate, score };
  }
  return best && best.score >= threshold ? best : null;
}
