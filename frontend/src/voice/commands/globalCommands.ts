import type { CommandDef } from "../intent/types";

/**
 * Always-available, page-independent commands (browser navigation and scrolling).
 * "stop listening" and "help" are handled by the provider itself, so they are not
 * defined here.
 *
 * Single responsibility: define the global verb commands.
 */
export function buildGlobalCommands(): CommandDef[] {
  return [
    {
      id: "global:back",
      title: "Go back",
      patterns: ["go back", "back"],
      handler: () => window.history.back(),
    },
    {
      id: "global:forward",
      title: "Go forward",
      patterns: ["go forward", "forward"],
      handler: () => window.history.forward(),
    },
    {
      id: "global:scroll-down",
      title: "Scroll down",
      patterns: ["scroll down", "page down"],
      handler: () => window.scrollBy({ top: window.innerHeight * 0.8, behavior: "smooth" }),
    },
    {
      id: "global:scroll-up",
      title: "Scroll up",
      patterns: ["scroll up", "page up"],
      handler: () => window.scrollBy({ top: -window.innerHeight * 0.8, behavior: "smooth" }),
    },
    {
      id: "global:scroll-top",
      title: "Scroll to top",
      patterns: ["scroll to top", "go to top"],
      handler: () => window.scrollTo({ top: 0, behavior: "smooth" }),
    },
  ];
}
