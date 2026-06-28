/**
 * Spoken feedback via the browser's built-in `SpeechSynthesis`. This is local,
 * OS-provided text-to-speech — it runs offline and sends nothing to a server, so
 * it satisfies the no-external-API requirement for read-back.
 *
 * Single responsibility: turn text into speech, expose whether we're currently
 * speaking (so the UI can animate), and let callers cancel it.
 */

const DEFAULT_LANG = "en-US";

let speaking = false;
const speakingListeners = new Set<(speaking: boolean) => void>();

function isSupported(): boolean {
  return typeof window !== "undefined" && "speechSynthesis" in window;
}

function setSpeaking(value: boolean): void {
  if (speaking === value) return;
  speaking = value;
  speakingListeners.forEach((listener) => listener(value));
}

/** Subscribe to speaking start/stop; returns an unsubscribe handle. */
export function onSpeakingChange(listener: (speaking: boolean) => void): () => void {
  speakingListeners.add(listener);
  return () => speakingListeners.delete(listener);
}

/** Speaks `text`, cancelling any in-progress utterance (barge-in). No-op if unsupported. */
export function speak(text: string): void {
  if (!isSupported() || !text.trim()) return;
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = DEFAULT_LANG;
  utterance.rate = 1.05;
  utterance.onstart = () => setSpeaking(true);
  utterance.onend = () => setSpeaking(false);
  utterance.onerror = () => setSpeaking(false);
  window.speechSynthesis.cancel();
  window.speechSynthesis.speak(utterance);
}

/** Stops any current speech, e.g. when listening resumes. */
export function stopSpeaking(): void {
  if (isSupported()) window.speechSynthesis.cancel();
  setSpeaking(false);
}
