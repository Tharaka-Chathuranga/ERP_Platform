import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { qk } from "@core/queryKeys";
import { AppButton } from "@ui/buttons/AppButton";
import { DataTable } from "@ui/data/DataTable";
import { StatusBadge } from "@ui/feedback/StatusBadge";
import { PageHeader } from "@ui/layout/PageHeader";
import type { AdminUser } from "@core/types";
import { listUsers } from "./users.api";
import { UserFormModal } from "./UserFormModal";

export function UserListPage() {
  const navigate = useNavigate();
  const [creating, setCreating] = useState(false);
  const { data, isLoading, error } = useQuery({
    queryKey: qk.adminUsers(),
    queryFn: listUsers,
  });

  return (
    <div>
      <PageHeader
        title="Users"
        actions={<AppButton label="New user" onClick={() => setCreating(true)} />}
      />

      <DataTable<AdminUser>
        data={data}
        loading={isLoading}
        error={error}
        rowKey={(r) => r.id}
        onRowClick={(r) => navigate(`/users/${r.id}`)}
        columns={[
          { header: "Username", render: (r) => r.username, emphasis: true },
          { header: "Name", render: (r) => r.displayName ?? "—" },
          { header: "Role", render: (r) => r.role.replace(/_/g, " ") },
          { header: "Department", render: (r) => r.department ?? "—" },
          {
            header: "Status",
            render: (r) => <StatusBadge status={r.enabled ? "ACTIVE" : "INACTIVE"} />,
          },
        ]}
      />

      <UserFormModal opened={creating} onClose={() => setCreating(false)} />
    </div>
  );
}
