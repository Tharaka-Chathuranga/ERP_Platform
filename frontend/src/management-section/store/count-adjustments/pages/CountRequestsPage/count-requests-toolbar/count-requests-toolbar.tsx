import { AppButton } from "@ui/buttons/AppButton";
import { TableToolbar } from "@ui/data";
import { COUNT_REQUEST_FILTERS } from "../hooks/use-count-requests";

interface CountRequestsToolbarProps {
  filter: (typeof COUNT_REQUEST_FILTERS)[number];
  onFilterChange: (value: (typeof COUNT_REQUEST_FILTERS)[number]) => void;
  search: string;
  onSearchChange: (value: string) => void;
  onCreate: () => void;
}

export function CountRequestsToolbar({
  filter,
  onFilterChange,
  search,
  onSearchChange,
  onCreate,
}: CountRequestsToolbarProps) {
  return (
    <TableToolbar
      filters={[{
        label: "Status",
        value: filter,
        onChange: (v) => onFilterChange(v as (typeof COUNT_REQUEST_FILTERS)[number]),
        options: COUNT_REQUEST_FILTERS.map((f) => ({ value: f, label: f.charAt(0) + f.slice(1).toLowerCase() })),
      }]}
      search={{ value: search, onChange: onSearchChange, placeholder: "Search item, user or reason…" }}
      actions={<AppButton label="New count request" onClick={onCreate} />}
    />
  );
}
