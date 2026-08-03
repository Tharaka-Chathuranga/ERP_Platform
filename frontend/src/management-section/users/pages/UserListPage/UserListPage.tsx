import { useNavigate } from "react-router-dom";
import { PageHeader } from "@ui/layout/PageHeader";
import { UserFormModal } from "../../components/UserFormModal";
import { useUserList } from "./hooks/use-user-list";
import { UserListToolbar } from "./user-list-toolbar";
import { UserListTable } from "./user-list-table";

export function UserListPage() {
  const navigate = useNavigate();
  const {
    creating,
    setCreating,
    search,
    setSearch,
    roleFilter,
    setRoleFilter,
    statusFilter,
    setStatusFilter,
    deptFilter,
    setDeptFilter,
    deptOptions,
    isLoading,
    error,
    rows,
  } = useUserList();

  return (
    <div>
      <PageHeader title="Users" />

      <UserListToolbar
        roleFilter={roleFilter}
        onRoleChange={setRoleFilter}
        statusFilter={statusFilter}
        onStatusChange={setStatusFilter}
        deptFilter={deptFilter}
        onDeptChange={setDeptFilter}
        deptOptions={deptOptions}
        search={search}
        onSearchChange={setSearch}
        onCreate={() => setCreating(true)}
      />

      <UserListTable
        data={rows}
        loading={isLoading}
        error={error}
        onRowClick={(r) => navigate(`/users/${r.id}`)}
      />

      <UserFormModal opened={creating} onClose={() => setCreating(false)} />
    </div>
  );
}
