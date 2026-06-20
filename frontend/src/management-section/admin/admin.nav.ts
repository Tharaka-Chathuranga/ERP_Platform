import { IconLayoutDashboard } from "@tabler/icons-react";
import type { NavItem } from "@store/store.nav";
import { DASHBOARD_ADMIN } from "@auth/permissions";

export const NAV: NavItem[] = [
  {
    to: "/overview",
    label: "Overview",
    icon: IconLayoutDashboard,
    color: "indigo",
    description: "Admin analytics & KPIs",
    requiredPermission: DASHBOARD_ADMIN,
  },
];
