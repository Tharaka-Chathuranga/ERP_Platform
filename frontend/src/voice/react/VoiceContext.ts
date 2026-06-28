import { createContext, useContext } from "react";
import type { PendingConfirmation } from "../confirmation/ConfirmationController";
import type { CommandDef } from "../intent/types";

/** High-level state of the voice system, surfaced to the UI. */
export type VoiceStatus = "unsupported" | "idle" | "loading" | "listening" | "error";

/**
 * The single state that drives the assistant's animation. Derived from the
 * engine status plus whether the assistant is currently thinking or talking.
 */
export type AssistantPhase =
  | "idle"
  | "loading"
  | "listening"
  | "processing"
  | "speaking"
  | "error";

export interface VoiceContextValue {
  readonly status: VoiceStatus;
  /** Animation-driving phase for the assistant UI. */
  readonly phase: AssistantPhase;
  /** One-off welcome line shown briefly after sign-in (null once dismissed). */
  readonly greeting: string | null;
  readonly isListening: boolean;
  /** In-progress (interim) transcript for the live HUD. */
  readonly partialTranscript: string;
  /** Last finalised utterance the system heard. */
  readonly lastHeard: string | null;
  /** Title of the last command that ran (for HUD feedback). */
  readonly lastCommandTitle: string | null;
  readonly pendingConfirmation: PendingConfirmation | null;
  readonly errorMessage: string | null;

  start: () => Promise<void>;
  stop: () => void;
  toggle: () => void;

  /** Resolve a pending mutating command by click (mirrors voice "confirm"/"cancel"). */
  confirmPending: () => void;
  cancelPending: () => void;

  /** (Un)register contextual commands — used by `useVoiceCommands`. */
  registerCommands: (commands: readonly CommandDef[]) => void;
  unregisterCommands: (commandIds: readonly string[]) => void;
  /** Commands the current user is allowed to invoke — for the help overlay. */
  listAvailableCommands: () => CommandDef[];
}

export const VoiceContext = createContext<VoiceContextValue | null>(null);

export function useVoice(): VoiceContextValue {
  const value = useContext(VoiceContext);
  if (!value) throw new Error("useVoice must be used within a VoiceProvider");
  return value;
}
