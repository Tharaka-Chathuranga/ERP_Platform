import { useEffect, useRef, type DependencyList } from "react";
import type { CommandDef } from "../intent/types";
import { useVoice } from "./VoiceContext";

/**
 * Registers contextual voice commands for the lifetime of the calling component
 * and tears them down on unmount, keeping the active grammar scoped to the
 * current page.
 *
 * Pass `deps` (e.g. the page's loaded data) so commands with `dynamic` slots
 * re-register when their underlying values change.
 */
export function useVoiceCommands(commands: CommandDef[], deps: DependencyList = []): void {
  const { registerCommands, unregisterCommands } = useVoice();
  const commandsRef = useRef(commands);
  commandsRef.current = commands;

  useEffect(() => {
    const current = commandsRef.current;
    registerCommands(current);
    return () => unregisterCommands(current.map((command) => command.id));
    // Re-register when registry handlers change or caller-provided deps change.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [registerCommands, unregisterCommands, ...deps]);
}
