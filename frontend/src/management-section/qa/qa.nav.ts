import { IconClipboardList } from "@tabler/icons-react";
import type { NavItem } from "@store/store.nav";
import { DEFECT_APPROVE } from "@auth/permissions";

export const NAV: NavItem[] = [
  {
    to: "/qa/defects",
    label: "Defect Review",
    icon: IconClipboardList,
    color: "grape",
    description: "Review & approve pending defect reports",
    requiredPermission: DEFECT_APPROVE,
  },
];
