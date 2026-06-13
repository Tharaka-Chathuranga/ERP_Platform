import { NAV as storeNav, type NavItem } from "@store/store.nav";

export type { NavItem };

/** Aggregates every management section's nav into one list for the sidebar and
 *  dashboard tiles. New sections append their own `*.nav.ts` here. */
export const NAV: NavItem[] = [...storeNav];
