import { TableToolbar } from "@ui/data";
import { NONCONFORMITY_ITEM_FILTERS, type NonconformityItemFilter } from "../hooks/use-nonconformity-items";

interface NonconformityItemsToolbarProps {
  filter: NonconformityItemFilter;
  onFilterChange: (value: NonconformityItemFilter) => void;
  search: string;
  onSearchChange: (value: string) => void;
}

export function NonconformityItemsToolbar({
  filter,
  onFilterChange,
  search,
  onSearchChange,
}: NonconformityItemsToolbarProps) {
  return (
    <TableToolbar
      filters={[
        {
          label: "Stage",
          value: filter,
          onChange: (v) => onFilterChange(v as NonconformityItemFilter),
          options: NONCONFORMITY_ITEM_FILTERS.map((f) => ({ value: f, label: f.replace(/_/g, " ") })),
        },
      ]}
      search={{ value: search, onChange: onSearchChange, placeholder: "Search item or description…" }}
    />
  );
}
