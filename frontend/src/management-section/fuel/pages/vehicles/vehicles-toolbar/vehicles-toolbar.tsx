import { Button } from "@mantine/core";
import { IconPlus } from "@tabler/icons-react";
import { TableToolbar } from "@ui/data";

interface VehiclesToolbarProps {
  search: string;
  onSearchChange: (value: string) => void;
  statusFilter: string;
  onStatusFilterChange: (value: string) => void;
  canManage: boolean;
  onCreate: () => void;
}

export function VehiclesToolbar({
  search,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
  canManage,
  onCreate,
}: VehiclesToolbarProps) {
  return (
    <TableToolbar
      search={{ value: search, onChange: onSearchChange, placeholder: "Search vehicle number…" }}
      filters={[
        {
          label: "Status",
          value: statusFilter,
          onChange: onStatusFilterChange,
          options: [
            { label: "All statuses", value: "ALL" },
            { label: "Active", value: "ACTIVE" },
            { label: "Inactive", value: "INACTIVE" },
          ],
        },
      ]}
      actions={
        canManage ? (
          <Button leftSection={<IconPlus size={16} />} onClick={onCreate}>
            New vehicle
          </Button>
        ) : undefined
      }
    />
  );
}
