import { Button } from "@mantine/core";
import { IconPlus } from "@tabler/icons-react";
import { TableToolbar } from "@ui/data";

interface SuppliersToolbarProps {
  search: string;
  onSearchChange: (value: string) => void;
  canManage: boolean;
  onCreate: () => void;
}

export function SuppliersToolbar({ search, onSearchChange, canManage, onCreate }: SuppliersToolbarProps) {
  return (
    <TableToolbar
      search={{ value: search, onChange: onSearchChange, placeholder: "Search code or name…" }}
      actions={
        canManage && (
          <Button leftSection={<IconPlus size={16} />} onClick={onCreate}>
            New supplier
          </Button>
        )
      }
    />
  );
}
