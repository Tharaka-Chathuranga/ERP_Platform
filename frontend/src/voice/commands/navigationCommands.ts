import { NAV } from "@nav/nav.registry";
import type { CommandDef } from "../intent/types";

/**
 * Navigation commands derived from the single nav registry, so spoken navigation
 * always tracks the real menu (and its per-item permissions) with zero drift.
 *
 * Single responsibility: NAV registry → "go to X" command definitions.
 */
export function buildNavigationCommands(): CommandDef[] {
  return NAV.map((item) => {
    const label = item.label.toLowerCase();
    return {
      id: `nav:${item.to}`,
      title: `Go to ${item.label}`,
      patterns: [
        `go to ${label}`,
        `open ${label}`,
        `show ${label}`,
        `navigate to ${label}`,
      ],
      requiredPermission: item.requiredPermission,
      handler: (_slots, context) => context.navigate(item.to),
    } satisfies CommandDef;
  });
}
