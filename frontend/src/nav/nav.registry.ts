import { NAV as adminNav } from "@admin/admin.nav";
import { NAV as storeNav, type NavItem } from "@store/store.nav";

export type { NavItem };

/** Aggregates every management section's nav into one list for the sidebar and
 *  dashboard tiles. New sections append their own `*.nav.ts` here. Admin-only
 *  entries are filtered by the consumer (the sidebar) based on the current role. */
export const NAV: NavItem[] = [...storeNav, ...adminNav];
