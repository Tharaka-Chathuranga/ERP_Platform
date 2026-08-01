import { Button } from "@mantine/core";
import { IconPlus } from "@tabler/icons-react";
import { TableToolbar } from "@ui/data";

interface OilMartSuppliersToolbarProps {
  search: string;
  onSearchChange: (value: string) => void;
  status: string;
  onStatusChange: (value: string) => void;
  canManage: boolean;
  onAdd: () => void;
}

export function OilMartSuppliersToolbar({
  search,
  onSearchChange,
  status,
  onStatusChange,
  canManage,
  onAdd,
}: OilMartSuppliersToolbarProps) {
  return (
    <TableToolbar
      search={{ value: search, onChange: onSearchChange, placeholder: "Search code, name or contact" }}
      filters={[
        {
          label: "Status",
          value: status,
          onChange: onStatusChange,
          options: [
            { value: "ALL", label: "All statuses" },
            { value: "ACTIVE", label: "Active" },
            { value: "INACTIVE", label: "Inactive" },
          ],
        },
      ]}
      actions={
        canManage ? (
          <Button leftSection={<IconPlus size={16} />} onClick={onAdd}>
            Add supplier
          </Button>
        ) : undefined
      }
    />
  );
}
