import {
  IconAlertTriangle,
  IconBuildingWarehouse,
  IconGasStation,
  IconPackageImport,
  type Icon,
} from "@tabler/icons-react";
import { NAV as adminNav } from "@admin/admin.nav";
import { NAV as storeNav, type NavItem } from "@store/store.nav";
import { NAV as fuelNav } from "@fuel/fuel.nav";
import { NAV as usersNav } from "@users/users.nav";
import { NAV as qaNav } from "@qa/qa.nav";

export type { NavItem };

/** Aggregates every management feature's nav into one list for the sidebar and
 *  dashboard tiles. Entries carrying a `requiredPermission` are filtered by the
 *  consumer against the current user's permissions; entries sharing a `group`
 *  are nested under a collapsible parent in the sidebar. */
export const NAV: NavItem[] = [...storeNav, ...fuelNav, ...usersNav, ...adminNav, ...qaNav];

/** Display metadata for collapsible sidebar groups, keyed by `NavItem.group`. */
export const GROUP_META: Record<string, { icon: Icon; color: string }> = {
  Operations: { icon: IconPackageImport, color: "teal" },
  Inventory: { icon: IconBuildingWarehouse, color: "brand" },
  Compliance: { icon: IconAlertTriangle, color: "orange" },
  Fuel: { icon: IconGasStation, color: "yellow" },
};
