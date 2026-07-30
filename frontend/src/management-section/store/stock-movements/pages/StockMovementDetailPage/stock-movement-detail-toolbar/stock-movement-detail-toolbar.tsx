import { Button } from "@mantine/core";
import { IconArrowLeft } from "@tabler/icons-react";
import { Link } from "react-router-dom";
import { TableToolbar } from "@ui/data";

interface FilterOption {
  value: string;
  label: string;
}

interface StockMovementDetailToolbarProps {
  search: string;
  onSearchChange: (value: string) => void;
  typeFilter: string;
  onTypeFilterChange: (value: string) => void;
  itemFilter: string;
  onItemFilterChange: (value: string) => void;
  range: [Date | null, Date | null];
  onRangeChange: (value: [Date | null, Date | null]) => void;
  typeOptions: FilterOption[];
  itemOptions: FilterOption[];
}

export function StockMovementDetailToolbar({
  search,
  onSearchChange,
  typeFilter,
  onTypeFilterChange,
  itemFilter,
  onItemFilterChange,
  range,
  onRangeChange,
  typeOptions,
  itemOptions,
}: StockMovementDetailToolbarProps) {
  return (
    <TableToolbar
      leftSection={
        <Button component={Link} to="/movements" variant="default" leftSection={<IconArrowLeft size={16} />}>
          Back to overview
        </Button>
      }
      filters={[
        { label: "Type", value: typeFilter, onChange: onTypeFilterChange, options: typeOptions },
        { label: "Item", value: itemFilter, onChange: onItemFilterChange, options: itemOptions },
        { type: "daterange", label: "Date", value: range, onChange: onRangeChange },
      ]}
      search={{ value: search, onChange: onSearchChange, placeholder: "Search item code or reference…" }}
      searchPosition="right"
    />
  );
}
