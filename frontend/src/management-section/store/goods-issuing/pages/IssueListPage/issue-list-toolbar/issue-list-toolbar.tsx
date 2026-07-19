import { Button } from "@mantine/core";
import { IconPlus } from "@tabler/icons-react";
import { TableToolbar } from "@ui/data";

const FILTERS: { label: string; value: string }[] = [
  { label: "All", value: "ALL" },
  { label: "Pending", value: "PENDING_APPROVAL" },
  { label: "Approved", value: "APPROVED" },
  { label: "Issued", value: "ISSUED" },
];

interface IssueListToolbarProps {
  filter: string;
  onFilterChange: (value: string) => void;
  search: string;
  onSearchChange: (value: string) => void;
  onCreate: () => void;
}

export function IssueListToolbar({
  filter,
  onFilterChange,
  search,
  onSearchChange,
  onCreate,
}: IssueListToolbarProps) {
  return (
    <TableToolbar
      filters={[{ label: "Status", value: filter, onChange: onFilterChange, options: FILTERS }]}
      search={{ value: search, onChange: onSearchChange, placeholder: "Search issue № or user…" }}
      actions={
        <Button leftSection={<IconPlus size={16} />} onClick={onCreate}>
          New goods issue
        </Button>
      }
    />
  );
}
