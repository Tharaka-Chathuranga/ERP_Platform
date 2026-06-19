import { IconLayoutDashboard } from "@tabler/icons-react";
import type { NavItem } from "@store/store.nav";

export const NAV: NavItem[] = [
  {
    to: "/overview",
    label: "Overview",
    icon: IconLayoutDashboard,
    color: "indigo",
    description: "Admin analytics & KPIs",
    requiredPermission: "dashboard:admin",
  },
];
