import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { useCan } from "@auth/useCan";
import { useAuth } from "@auth/AuthContext";
import type { Permission } from "@auth/permissions";

import { createEngine } from "../engine/createEngine";
import type { SpeechRecognitionEngine } from "../engine/SpeechRecognitionEngine";
import { CommandRegistry } from "../intent/CommandRegistry";
import { IntentMatcher } from "../intent/matching/IntentMatcher";
import { IntentResolver } from "../intent/strategies/IntentResolver";
import { RuleBasedStrategy } from "../intent/strategies/RuleBasedStrategy";
import type { CommandContext } from "../intent/types";
import {
  ConfirmationController,
  type ConfirmationOutcome,
  type PendingConfirmation,
} from "../confirmation/ConfirmationController";
import { interpretConfirmation } from "../confirmation/confirmationGrammar";
import { onSpeakingChange, speak, stopSpeaking } from "../feedback/speak";
import { buildNavigationCommands } from "../commands/navigationCommands";
import { buildGlobalCommands } from "../commands/globalCommands";
import {
  VoiceContext,
  type AssistantPhase,
  type VoiceContextValue,
  type VoiceStatus,
} from "./VoiceContext";

/**
 * Central orchestrator: owns the speech engine, the command registry, the intent
 * resolver and the confirmation gate, and exposes a small React context. It keeps
 * the engine swappable and the matcher pure — this component only wires them.
 */
export function VoiceProvider({ children }: { children: ReactNode }) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const can = useCan();
  const { isAuthenticated, username } = useAuth();

  // Latest mutable values, read by command handlers without re-binding listeners.
  const canRef = useRef(can);
  canRef.current = can;

  // Stable singletons for the lifetime of the provider.
  const registry = useMemo(() => new CommandRegistry(), []);
  const resolver = useMemo(
    () => new IntentResolver([new RuleBasedStrategy(new IntentMatcher())]),
    [],
  );
  const confirmation = useMemo(() => new ConfirmationController(), []);

  const engineRef = useRef<SpeechRecognitionEngine | null>(null);

  const [status, setStatus] = useState<VoiceStatus>("idle");
  const [partialTranscript, setPartialTranscript] = useState("");
  const [lastHeard, setLastHeard] = useState<string | null>(null);
  const [lastCommandTitle, setLastCommandTitle] = useState<string | null>(null);
  const [pendingConfirmation, setPendingConfirmation] = useState<PendingConfirmation | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [greeting, setGreeting] = useState<string | null>(null);

  /** Commands the current user is permitted to invoke. */
  const availableCommands = useCallback(
    () =>
      registry
        .list()
        .filter((command) => !command.requiredPermission || canRef.current(command.requiredPermission)),
    [registry],
  );

  const makeContext = useCallback(
    (): CommandContext => ({
      navigate,
      can: (permission: Permission) => canRef.current(permission),
      speak,
      queryClient,
    }),
    [navigate, queryClient],
  );

  const announceOutcome = useCallback((outcome: ConfirmationOutcome, error?: unknown) => {
    switch (outcome) {
      case "confirmed":
        speak("Done.");
        break;
      case "cancelled":
        speak("Cancelled.");
        break;
      case "timeout":
        speak("No response, cancelled.");
        break;
      case "error":
        speak(error instanceof Error ? error.message : "Sorry, that failed.");
        break;
    }
  }, []);

  const handleFinalTranscript = useCallback(
    async (transcript: string) => {
      setPartialTranscript("");
      setLastHeard(transcript);
      stopSpeaking();
      setIsProcessing(true);
      try {
        // While a mutation is pending, only yes/no is interpreted.
        if (confirmation.isPending) {
          const answer = interpretConfirmation(transcript);
          if (answer === "confirm") await confirmation.confirm();
          else if (answer === "cancel") confirmation.cancel();
          return;
        }

        const match = await resolver.resolve(transcript, registry.list());
        if (!match) return;
        const command = registry.get(match.commandId);
        if (!command) return;

        if (command.requiredPermission && !canRef.current(command.requiredPermission)) {
          speak("You don't have permission to do that.");
          return;
        }

        setLastCommandTitle(command.title);
        const context = makeContext();

        if (command.mutating) {
          const description = command.describe?.(match.slots) ?? command.title;
          confirmation.begin({
            description,
            execute: () => Promise.resolve(command.handler(match.slots, context)),
            onSettled: announceOutcome,
          });
          speak(`${description}. Say confirm or cancel.`);
          return;
        }

        await command.handler(match.slots, context);
      } catch (error) {
        speak(error instanceof Error ? error.message : "Sorry, that failed.");
      } finally {
        setIsProcessing(false);
      }
    },
    [announceOutcome, confirmation, makeContext, registry, resolver],
  );

  // Register global + navigation commands once.
  useEffect(() => {
    registry.register([...buildGlobalCommands(), ...buildNavigationCommands()]);
  }, [registry]);

  // Mirror confirmation state into React.
  useEffect(() => {
    return confirmation.onChange(() => setPendingConfirmation(confirmation.getPending()));
  }, [confirmation]);

  // Reflect text-to-speech activity so the assistant can animate while talking.
  useEffect(() => onSpeakingChange(setIsSpeaking), []);

  // Greet the user only the FIRST time they ever sign in (persisted per user),
  // then hide it for good — it won't reappear on later logins or reloads.
  const greetedRef = useRef(false);
  const greetingTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => {
    if (!isAuthenticated || greetedRef.current) return;
    const storageKey = `erp.voice.greeted${username ? `.${username}` : ""}`;
    if (localStorage.getItem(storageKey)) return;
    greetedRef.current = true;
    localStorage.setItem(storageKey, "1");
    const name = username ? `, ${username}` : "";
    const message = `Hello${name}. I'm your assistant. Tap the orb or say a command and I'll help you.`;
    setGreeting(message);
    speak(message);
    greetingTimerRef.current = setTimeout(() => setGreeting(null), 8000);
  }, [isAuthenticated, username]);

  const phase: AssistantPhase =
    status === "error"
      ? "error"
      : status === "loading"
        ? "loading"
        : isProcessing
          ? "processing"
          : isSpeaking
            ? "speaking"
            : status === "listening"
              ? "listening"
              : "idle";

  const ensureEngine = useCallback(async (): Promise<SpeechRecognitionEngine> => {
    if (engineRef.current) return engineRef.current;
    const engine = await createEngine();
    engine.onPartial((result) => setPartialTranscript(result.transcript));
    engine.onFinal((result) => void handleFinalTranscript(result.transcript));
    engine.onError((error) => {
      setErrorMessage(error.message);
      setStatus("error");
    });
    engine.onStateChange((state) => {
      if (state === "listening") setStatus("listening");
      else if (state === "loading") setStatus("loading");
      else if (state === "error") setStatus("error");
      else setStatus("idle");
    });
    engineRef.current = engine;
    return engine;
  }, [handleFinalTranscript]);

  const start = useCallback(async () => {
    try {
      setErrorMessage(null);
      setStatus("loading");
      const engine = await ensureEngine();
      await engine.init();
      await engine.start();
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Voice control unavailable.");
      setStatus("error");
    }
  }, [ensureEngine]);

  const stop = useCallback(() => {
    void engineRef.current?.stop();
    stopSpeaking();
  }, []);

  const toggle = useCallback(() => {
    if (status === "listening") stop();
    else void start();
  }, [start, status, stop]);

  // Tear down on unmount.
  useEffect(() => {
    return () => {
      if (greetingTimerRef.current !== null) clearTimeout(greetingTimerRef.current);
      confirmation.dispose();
      void engineRef.current?.dispose();
      stopSpeaking();
    };
  }, [confirmation]);

  const value: VoiceContextValue = useMemo(
    () => ({
      status,
      phase,
      greeting,
      isListening: status === "listening",
      partialTranscript,
      lastHeard,
      lastCommandTitle,
      pendingConfirmation,
      errorMessage,
      start,
      stop,
      toggle,
      confirmPending: () => void confirmation.confirm(),
      cancelPending: () => confirmation.cancel(),
      registerCommands: (commands) => registry.register(commands),
      unregisterCommands: (commandIds) => registry.unregister(commandIds),
      listAvailableCommands: availableCommands,
    }),
    [
      availableCommands,
      confirmation,
      errorMessage,
      greeting,
      lastCommandTitle,
      lastHeard,
      partialTranscript,
      pendingConfirmation,
      phase,
      registry,
      start,
      status,
      stop,
      toggle,
    ],
  );

  return <VoiceContext.Provider value={value}>{children}</VoiceContext.Provider>;
}
