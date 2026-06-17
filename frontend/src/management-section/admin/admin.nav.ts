import {
  IconBuildingWarehouse,
  IconShieldLock,
  IconTruck,
  IconUsers,
} from "@tabler/icons-react";
import type { NavItem } from "@store/store.nav";

/** Admin section navigation. Every entry is admin-only; the sidebar hides them
 *  from non-administrators. Appended to the shared NAV in the registry. */
export const NAV: NavItem[] = [
  {
    to: "/admin",
    label: "Admin",
    icon: IconShieldLock,
    color: "indigo",
    description: "System overview & controls",
    adminOnly: true,
  },
  {
    to: "/admin/store",
    label: "Store Admin",
    icon: IconBuildingWarehouse,
    color: "indigo",
    description: "Items, defects, counts & warnings",
    adminOnly: true,
  },
  {
    to: "/admin/users",
    label: "Users",
    icon: IconUsers,
    color: "indigo",
    description: "Manage users, roles & access",
    adminOnly: true,
  },
  {
    to: "/admin/suppliers",
    label: "Suppliers",
    icon: IconTruck,
    color: "indigo",
    description: "Manage supplier master data",
    adminOnly: true,
  },
];
