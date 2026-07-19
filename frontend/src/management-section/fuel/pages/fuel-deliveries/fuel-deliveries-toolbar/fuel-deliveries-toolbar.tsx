import { Button } from "@mantine/core";
import { IconPlus } from "@tabler/icons-react";
import { TableToolbar } from "@ui/data";

interface FuelDeliveriesToolbarProps {
  search: string;
  onSearchChange: (value: string) => void;
  dateRange: [Date | null, Date | null];
  onDateRangeChange: (value: [Date | null, Date | null]) => void;
  canCreate: boolean;
  onCreate: () => void;
}

export function FuelDeliveriesToolbar({
  search,
  onSearchChange,
  dateRange,
  onDateRangeChange,
  canCreate,
  onCreate,
}: FuelDeliveriesToolbarProps) {
  return (
    <TableToolbar
      search={{ value: search, onChange: onSearchChange, placeholder: "Search reference or supplier…" }}
      filters={[{ type: "daterange", label: "Date", value: dateRange, onChange: onDateRangeChange }]}
      actions={
        canCreate ? (
          <Button leftSection={<IconPlus size={16} />} onClick={onCreate}>
            New delivery
          </Button>
        ) : undefined
      }
    />
  );
}
