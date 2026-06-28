import type { SpeechRecognitionEngine } from "./SpeechRecognitionEngine";
import { NativeSpeechEngine } from "./native/NativeSpeechEngine";

/**
 * Creates the speech engine. The app uses the browser-native Web Speech API: in
 * Chrome/Edge this is Google's speech-to-text used for free — no API key, billing
 * or backend call. Accurate and zero-setup; it streams audio to Google (Apple on
 * Safari) and is unsupported on Firefox / iOS-Chrome.
 *
 * Kept as a factory behind the {@link SpeechRecognitionEngine} interface so a
 * different recognizer can be swapped in without touching command/intent code.
 */
export async function createEngine(): Promise<SpeechRecognitionEngine> {
  return new NativeSpeechEngine();
}
