import { AppButton } from "@ui/buttons/AppButton";
import { TableToolbar } from "@ui/data";

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

interface UserListToolbarProps {
  roleFilter: string;
  onRoleChange: (value: string) => void;
  statusFilter: string;
  onStatusChange: (value: string) => void;
  deptFilter: string;
  onDeptChange: (value: string) => void;
  deptOptions: { label: string; value: string }[];
  search: string;
  onSearchChange: (value: string) => void;
  onCreate: () => void;
}

export function UserListToolbar({
  roleFilter,
  onRoleChange,
  statusFilter,
  onStatusChange,
  deptFilter,
  onDeptChange,
  deptOptions,
  search,
  onSearchChange,
  onCreate,
}: UserListToolbarProps) {
  return (
    <TableToolbar
      filters={[
        { label: "Role", value: roleFilter, onChange: onRoleChange, options: ROLE_OPTIONS },
        { label: "Status", value: statusFilter, onChange: onStatusChange, options: STATUS_OPTIONS },
        { label: "Department", value: deptFilter, onChange: onDeptChange, options: deptOptions },
      ]}
      search={{ value: search, onChange: onSearchChange, placeholder: "Search username or name…" }}
      actions={<AppButton label="New user" onClick={onCreate} />}
    />
  );
}
