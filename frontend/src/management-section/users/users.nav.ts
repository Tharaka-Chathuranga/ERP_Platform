import { IconUsers } from "@tabler/icons-react";
import type { NavItem } from "@store/store.nav";
import { USER_MANAGE } from "@auth/permissions";

export const NAV: NavItem[] = [
  {
    to: "/users",
    label: "Users",
    icon: IconUsers,
    color: "indigo",
    description: "Manage users, roles & access",
    requiredPermission: USER_MANAGE,
  },
];
