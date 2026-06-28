import { EngineEventHub } from "../EngineEventHub";
import type {
  EngineState,
  SpeechRecognitionEngine,
  Unsubscribe,
} from "../SpeechRecognitionEngine";
import {
  resolveRecognitionConstructor,
  type BrowserSpeechRecognition,
  type BrowserSpeechRecognitionEvent,
} from "./browserSpeechRecognition.types";

/**
 * Development-only engine backed by the browser's built-in `SpeechRecognition`.
 *
 * NOTE: in Chrome this streams audio to Google's servers, so it is NEVER used in
 * production (the offline requirement). It exists purely so command/intent logic
 * and the HUD can be exercised without downloading the 40MB Vosk model. The
 * factory in `createEngine` only selects it in dev.
 *
 * The native API has no usable grammar-constraining, so `setGrammar` is a no-op
 * here; accuracy parity with production is provided by the Vosk engine.
 */
export class NativeSpeechEngine implements SpeechRecognitionEngine {
  readonly id = "native";

  private readonly hub = new EngineEventHub();
  private recognition: BrowserSpeechRecognition | null = null;
  private currentState: EngineState = "idle";
  private intentionallyListening = false;

  get state(): EngineState {
    return this.currentState;
  }

  async init(): Promise<void> {
    if (this.recognition) return;
    const Recognition = resolveRecognitionConstructor();
    if (!Recognition) {
      throw new Error("This browser does not support the SpeechRecognition API.");
    }
    const recognition = new Recognition();
    recognition.lang = "en-US";
    recognition.continuous = true;
    recognition.interimResults = true;

    recognition.onresult = (event) => this.handleResult(event);
    recognition.onerror = (event) => {
      this.hub.emitError(new Error(`Speech recognition error: ${event.error}`));
    };
    // The native engine stops itself after silence; restart while the user
    // intends to keep listening so the experience matches a continuous engine.
    recognition.onend = () => {
      if (this.intentionallyListening) {
        try {
          recognition.start();
        } catch {
          // start() throws if called too soon after end(); the next onend retries.
        }
      } else {
        this.setState("ready");
      }
    };

    this.recognition = recognition;
    this.setState("ready");
  }

  async start(): Promise<void> {
    if (!this.recognition) await this.init();
    this.intentionallyListening = true;
    this.recognition!.start();
    this.setState("listening");
  }

  async stop(): Promise<void> {
    this.intentionallyListening = false;
    this.recognition?.stop();
    this.setState("ready");
  }

  onPartial(callback: Parameters<EngineEventHub["onPartial"]>[0]): Unsubscribe {
    return this.hub.onPartial(callback);
  }
  onFinal(callback: Parameters<EngineEventHub["onFinal"]>[0]): Unsubscribe {
    return this.hub.onFinal(callback);
  }
  onError(callback: Parameters<EngineEventHub["onError"]>[0]): Unsubscribe {
    return this.hub.onError(callback);
  }
  onStateChange(callback: Parameters<EngineEventHub["onStateChange"]>[0]): Unsubscribe {
    return this.hub.onStateChange(callback);
  }

  async dispose(): Promise<void> {
    this.intentionallyListening = false;
    if (this.recognition) {
      this.recognition.onresult = null;
      this.recognition.onerror = null;
      this.recognition.onend = null;
      this.recognition.abort();
      this.recognition = null;
    }
    this.hub.clear();
    this.setState("idle");
  }

  private handleResult(event: BrowserSpeechRecognitionEvent): void {
    const result = event.results[event.resultIndex];
    if (!result) return;
    const alternative = result[0];
    if (!alternative) return;
    const transcript = alternative.transcript.trim().toLowerCase();
    if (!transcript) return;

    if (result.isFinal) {
      this.hub.emitFinal({ transcript, confidence: alternative.confidence, isFinal: true });
    } else {
      this.hub.emitPartial({ transcript, confidence: alternative.confidence, isFinal: false });
    }
  }

  private setState(state: EngineState): void {
    if (this.currentState === state) return;
    this.currentState = state;
    this.hub.emitState(state);
  }
}
