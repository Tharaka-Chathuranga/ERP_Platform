import type {
  EngineState,
  RecognitionResult,
  Unsubscribe,
} from "./SpeechRecognitionEngine";

/**
 * Shared subscriber bookkeeping for engine implementations. Concrete engines
 * compose this hub instead of re-implementing the four callback registries, so
 * the `on*`/`emit*` plumbing lives in exactly one place.
 */
export class EngineEventHub {
  private readonly partialListeners = new Set<(result: RecognitionResult) => void>();
  private readonly finalListeners = new Set<(result: RecognitionResult) => void>();
  private readonly errorListeners = new Set<(error: Error) => void>();
  private readonly stateListeners = new Set<(state: EngineState) => void>();

  onPartial(callback: (result: RecognitionResult) => void): Unsubscribe {
    return this.subscribe(this.partialListeners, callback);
  }

  onFinal(callback: (result: RecognitionResult) => void): Unsubscribe {
    return this.subscribe(this.finalListeners, callback);
  }

  onError(callback: (error: Error) => void): Unsubscribe {
    return this.subscribe(this.errorListeners, callback);
  }

  onStateChange(callback: (state: EngineState) => void): Unsubscribe {
    return this.subscribe(this.stateListeners, callback);
  }

  emitPartial(result: RecognitionResult): void {
    this.partialListeners.forEach((listener) => listener(result));
  }

  emitFinal(result: RecognitionResult): void {
    this.finalListeners.forEach((listener) => listener(result));
  }

  emitError(error: Error): void {
    this.errorListeners.forEach((listener) => listener(error));
  }

  emitState(state: EngineState): void {
    this.stateListeners.forEach((listener) => listener(state));
  }

  clear(): void {
    this.partialListeners.clear();
    this.finalListeners.clear();
    this.errorListeners.clear();
    this.stateListeners.clear();
  }

  private subscribe<T>(registry: Set<T>, callback: T): Unsubscribe {
    registry.add(callback);
    return () => registry.delete(callback);
  }
}
