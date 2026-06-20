import { IconShieldCheck } from "@tabler/icons-react";
import type { NavItem } from "@store/store.nav";

export const NAV: NavItem[] = [
  {
    to: "/qa",
    label: "Quality Assurance",
    icon: IconShieldCheck,
    color: "grape",
    description: "Review & approve defect reports",
    requiredPermission: "dashboard:qa",
  },
];
