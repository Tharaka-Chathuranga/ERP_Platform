import { Button } from "@mantine/core";
import { IconPlus } from "@tabler/icons-react";
import { TableToolbar } from "@ui/data";

interface ReceivingListToolbarProps {
  search: string;
  onSearchChange: (value: string) => void;
  onCreate: () => void;
}

export function ReceivingListToolbar({ search, onSearchChange, onCreate }: ReceivingListToolbarProps) {
  return (
    <TableToolbar
      search={{ value: search, onChange: onSearchChange, placeholder: "Search receival № or supplier…" }}
      actions={
        <Button leftSection={<IconPlus size={16} />} onClick={onCreate}>
          New item receival
        </Button>
      }
    />
  );
}
