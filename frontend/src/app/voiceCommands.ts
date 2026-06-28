import { qk } from "@core/queryKeys";
import { STOCK_VIEW } from "@auth/permissions";
import { getLowStockItems } from "@store/inventory/items.api";
import type { LowStockItem } from "@core/types";
import type { CommandContext, CommandDef } from "@voice/index";

/**
 * Application-wide voice command catalog, registered once for the whole app
 * (see AppVoiceCommands) instead of per page. Each command is self-contained:
 * it pulls whatever data it needs through the shared `queryClient` + `qk` keys,
 * so it works from any page without coupling to a component's local state.
 *
 * Navigation and global verbs are provided by the voice module itself; this file
 * holds the data-aware ERP commands (read-backs, and api-direct actions).
 */

/** Reads cached data if present, otherwise fetches it through react-query. */
function readData<T>(context: CommandContext, queryKey: readonly unknown[], queryFn: () => Promise<T>): Promise<T> {
  const cached = context.queryClient.getQueryData<T>(queryKey);
  if (cached !== undefined) return Promise.resolve(cached);
  return context.queryClient.fetchQuery({ queryKey, queryFn });
}

const readLowStock: CommandDef = {
  id: "store.lowstock.read",
  title: "Read low-stock summary",
  patterns: [
    "how many items are low",
    "what is low on stock",
    "read low stock",
    "low stock summary",
  ],
  requiredPermission: STOCK_VIEW,
  handler: async (_slots, context) => {
    const items = await readData<LowStockItem[]>(context, qk.lowStock(), getLowStockItems);
    if (items.length === 0) {
      context.speak("Nothing is below reorder level. All good.");
      return;
    }
    const critical = items.filter((item) => item.criticalItem).length;
    const names = items.slice(0, 3).map((item) => item.name).join(", ");
    const criticalNote = critical > 0 ? `, ${critical} critical` : "";
    context.speak(
      `${items.length} item${items.length === 1 ? "" : "s"} below reorder level${criticalNote}. ${names}.`,
    );
  },
};

/** The full app command catalog (extend this as more voice actions are added). */
export function buildAppCommands(): CommandDef[] {
  return [readLowStock];
}
