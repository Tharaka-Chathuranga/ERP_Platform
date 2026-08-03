import { Button } from "@mantine/core";
import { IconPlus } from "@tabler/icons-react";
import { TableToolbar } from "@ui/data";

interface FuelPricesToolbarProps {
  dateRange: [Date | null, Date | null];
  onDateRangeChange: (value: [Date | null, Date | null]) => void;
  canManage: boolean;
  onAdd: () => void;
}

export function FuelPricesToolbar({ dateRange, onDateRangeChange, canManage, onAdd }: FuelPricesToolbarProps) {
  return (
    <TableToolbar
      filters={[
        {
          type: "daterange",
          label: "Effective period",
          value: dateRange,
          onChange: onDateRangeChange,
        },
      ]}
      actions={
        canManage ? (
          <Button leftSection={<IconPlus size={16} />} onClick={onAdd}>
            Add price
          </Button>
        ) : undefined
      }
    />
  );
}
