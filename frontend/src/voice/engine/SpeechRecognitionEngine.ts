/**
 * Engine-agnostic contract for the speech-to-text layer.
 *
 * The rest of the voice module depends ONLY on this interface, never on a
 * concrete recognizer, so the recognition backend stays swappable without
 * touching command/intent code.
 */

/** A single recognition emission from the engine. */
export interface RecognitionResult {
  /** Recognised text, already lower-cased and trimmed by the engine. */
  readonly transcript: string;
  /** Engine confidence in 0..1 when available; otherwise undefined. */
  readonly confidence?: number;
  /** True once the utterance is complete (vs. an in-progress partial). */
  readonly isFinal: boolean;
}

/** Lifecycle state, surfaced to the UI for the voice HUD. */
export type EngineState =
  | "idle" // constructed, not initialised
  | "loading" // initialising the recogniser
  | "ready" // initialised, not capturing
  | "listening" // capturing microphone audio
  | "error";

/** Unsubscribe handle returned by every `on*` registration. */
export type Unsubscribe = () => void;

export interface SpeechRecognitionEngine {
  /** Stable identifier, e.g. "native". */
  readonly id: string;

  /** Current lifecycle state (synchronous snapshot). */
  readonly state: EngineState;

  /** Prepare the underlying recogniser. Called lazily on first activation. Idempotent. */
  init(): Promise<void>;

  /** Begin capturing the microphone and decoding. Must be called from a user gesture. */
  start(): Promise<void>;

  /** Stop capturing. */
  stop(): Promise<void>;

  onPartial(callback: (result: RecognitionResult) => void): Unsubscribe;
  onFinal(callback: (result: RecognitionResult) => void): Unsubscribe;
  onError(callback: (error: Error) => void): Unsubscribe;
  onStateChange(callback: (state: EngineState) => void): Unsubscribe;

  /** Tear down the recogniser and release the microphone & model memory. */
  dispose(): Promise<void>;
}
