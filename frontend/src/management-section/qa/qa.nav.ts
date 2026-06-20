import { IconShieldCheck } from "@tabler/icons-react";
import type { NavItem } from "@store/store.nav";
import { DASHBOARD_QA } from "@auth/permissions";

export const NAV: NavItem[] = [
  {
    to: "/qa",
    label: "Quality Assurance",
    icon: IconShieldCheck,
    color: "grape",
    description: "Review & approve defect reports",
    requiredPermission: DASHBOARD_QA,
  },
];
