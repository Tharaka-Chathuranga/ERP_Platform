import { DataTable } from "@ui/data/DataTable";
import type { AdminUser } from "@core/types";
import { buildUserListColumns } from "./user-list-columns";

interface UserListTableProps {
  data: AdminUser[];
  loading: boolean;
  error: unknown;
  onRowClick: (user: AdminUser) => void;
}

export function UserListTable({ data, loading, error, onRowClick }: UserListTableProps) {
  const columns = buildUserListColumns();

  return (
    <DataTable<AdminUser>
      data={data}
      loading={loading}
      error={error}
      rowKey={(r) => r.id}
      onRowClick={onRowClick}
      columns={columns}
    />
  );
}
