import { Button } from "@mantine/core";
import { IconPlus } from "@tabler/icons-react";
import { TableToolbar } from "@ui/data";

const FILTERS = [
  { label: "All", value: "ALL" },
  { label: "Pending", value: "PENDING" },
  { label: "Approved", value: "APPROVED" },
  { label: "Rejected", value: "REJECTED" },
];

interface RequestListToolbarProps {
  filter: string;
  onFilterChange: (value: string) => void;
  onCreate: () => void;
}

export function RequestListToolbar({ filter, onFilterChange, onCreate }: RequestListToolbarProps) {
  return (
    <TableToolbar
      filters={[{ label: "Status", value: filter, onChange: onFilterChange, options: FILTERS }]}
      actions={
        <Button leftSection={<IconPlus size={16} />} onClick={onCreate}>
          New borrow request
        </Button>
      }
    />
  );
}
