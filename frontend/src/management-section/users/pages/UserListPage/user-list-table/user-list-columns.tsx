import { type Column } from "@ui/data";
import { StatusBadge } from "@ui/feedback/StatusBadge";
import type { AdminUser } from "@core/types";

export function buildUserListColumns(): Column<AdminUser>[] {
  return [
    { header: "Username", render: (r) => r.username, emphasis: true },
    { header: "Name", render: (r) => r.displayName ?? "—" },
    { header: "Role", render: (r) => r.role.replace(/_/g, " ") },
    { header: "Department", render: (r) => r.department ?? "—" },
    {
      header: "Status",
      render: (r) => <StatusBadge status={r.enabled ? "ACTIVE" : "INACTIVE"} />,
    },
  ];
}
