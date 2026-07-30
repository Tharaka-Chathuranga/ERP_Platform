import { Button } from "@mantine/core";
import { IconPlus } from "@tabler/icons-react";
import { TableToolbar } from "@ui/data";

const STATUS_OPTIONS = [
  { label: "All statuses", value: "ALL" },
  { label: "Active", value: "ACTIVE" },
  { label: "Inactive", value: "INACTIVE" },
];

const FLAG_OPTIONS = [
  { label: "All flags", value: "ALL" },
  { label: "Critical", value: "CRITICAL" },
  { label: "Approval required", value: "APPROVAL" },
];

interface ItemsToolbarProps {
  search: string;
  onSearchChange: (value: string) => void;
  categoryFilter: string;
  onCategoryChange: (value: string) => void;
  categoryOptions: { label: string; value: string }[];
  statusFilter: string;
  onStatusChange: (value: string) => void;
  flagFilter: string;
  onFlagChange: (value: string) => void;
  canEdit: boolean;
  onCreate: () => void;
}

export function ItemsToolbar({
  search,
  onSearchChange,
  categoryFilter,
  onCategoryChange,
  categoryOptions,
  statusFilter,
  onStatusChange,
  flagFilter,
  onFlagChange,
  canEdit,
  onCreate,
}: ItemsToolbarProps) {
  return (
    <TableToolbar
      filters={[
        { label: "Category", value: categoryFilter, onChange: onCategoryChange, options: categoryOptions },
        { label: "Status", value: statusFilter, onChange: onStatusChange, options: STATUS_OPTIONS },
        { label: "Flag", value: flagFilter, onChange: onFlagChange, options: FLAG_OPTIONS },
      ]}
      search={{ value: search, onChange: onSearchChange, placeholder: "Search item code or name…" }}
      actions={
        canEdit ? (
          <Button leftSection={<IconPlus size={16} />} onClick={onCreate}>
            New item
          </Button>
        ) : undefined
      }
    />
  );
}
