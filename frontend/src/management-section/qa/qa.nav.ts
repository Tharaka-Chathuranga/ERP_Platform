import { IconClipboardList } from "@tabler/icons-react";
import type { NavItem } from "@store/store.nav";
import { NCR_REVIEW } from "@auth/permissions";

export const NAV: NavItem[] = [
  {
    to: "/qa/nonconformities",
    label: "Nonconformity Review",
    icon: IconClipboardList,
    color: "grape",
    description: "Review, disposition & close nonconformity reports",
    requiredPermission: NCR_REVIEW,
  },
];
