import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { qk } from "@core/queryKeys";
import { AppButton } from "@ui/buttons/AppButton";
import { DataTable } from "@ui/data/DataTable";
import { TableToolbar } from "@ui/data";
import { StatusBadge } from "@ui/feedback/StatusBadge";
import { PageHeader } from "@ui/layout/PageHeader";
import type { AdminUser } from "@core/types";
import { listUsers } from "./users.api";
import { UserFormModal } from "./UserFormModal";

const ROLE_OPTIONS = [
  { label: "All roles", value: "ALL" },
  { label: "Admin", value: "ADMIN" },
  { label: "Store Keeper", value: "STORE_KEEPER" },
  { label: "Quality Assurance", value: "QUALITY_ASSURANCE" },
];

const STATUS_OPTIONS = [
  { label: "All", value: "ALL" },
  { label: "Active", value: "ACTIVE" },
  { label: "Inactive", value: "INACTIVE" },
];

export function UserListPage() {
  const navigate = useNavigate();
  const [creating, setCreating] = useState(false);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [deptFilter, setDeptFilter] = useState("ALL");

  const { data, isLoading, error } = useQuery({
    queryKey: qk.adminUsers(),
    queryFn: listUsers,
  });

  const deptOptions = useMemo(() => {
    const depts = Array.from(
      new Set((data ?? []).map((u) => u.department).filter(Boolean) as string[]),
    ).sort();
    return [
      { label: "All departments", value: "ALL" },
      ...depts.map((d) => ({ label: d, value: d })),
    ];
  }, [data]);

  const term = search.trim().toLowerCase();
  const rows = (data ?? []).filter((r) => {
    if (term && !r.username.toLowerCase().includes(term) && !(r.displayName ?? "").toLowerCase().includes(term)) return false;
    if (roleFilter !== "ALL" && r.role !== roleFilter) return false;
    if (statusFilter === "ACTIVE" && !r.enabled) return false;
    if (statusFilter === "INACTIVE" && r.enabled) return false;
    if (deptFilter !== "ALL" && r.department !== deptFilter) return false;
    return true;
  });

  return (
    <div>
      <PageHeader title="Users" />

      <TableToolbar
        filters={[
          { label: "Role", value: roleFilter, onChange: setRoleFilter, options: ROLE_OPTIONS },
          { label: "Status", value: statusFilter, onChange: setStatusFilter, options: STATUS_OPTIONS },
          { label: "Department", value: deptFilter, onChange: setDeptFilter, options: deptOptions },
        ]}
        search={{ value: search, onChange: setSearch, placeholder: "Search username or name…" }}
        actions={<AppButton label="New user" onClick={() => setCreating(true)} />}
      />

      <DataTable<AdminUser>
        data={rows}
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
