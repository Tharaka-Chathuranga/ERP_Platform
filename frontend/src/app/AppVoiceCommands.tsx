import { useMemo } from "react";
import { useVoiceCommands } from "@voice/index";
import { buildAppCommands } from "./voiceCommands";

/**
 * Registers the application-wide voice command catalog once, for the whole
 * authenticated app. Renders nothing — it exists only to own the registration
 * lifecycle, so feature pages don't each have to wire commands.
 */
export function AppVoiceCommands() {
  const commands = useMemo(() => buildAppCommands(), []);
  useVoiceCommands(commands);
  return null;
}
