import { Button } from "@mantine/core";
import { IconPlus } from "@tabler/icons-react";
import { TableToolbar } from "@ui/data";
import type { OilMartSupplier } from "@core/types";

interface OilMartReceiptsToolbarProps {
  suppliers: OilMartSupplier[];
  supplierId: string;
  onSupplierChange: (value: string) => void;
  dateRange: [Date | null, Date | null];
  onDateRangeChange: (value: [Date | null, Date | null]) => void;
  canReceive: boolean;
  onNew: () => void;
}

export function OilMartReceiptsToolbar({
  suppliers,
  supplierId,
  onSupplierChange,
  dateRange,
  onDateRangeChange,
  canReceive,
  onNew,
}: OilMartReceiptsToolbarProps) {
  return (
    <TableToolbar
      filters={[
        {
          label: "Supplier",
          value: supplierId,
          onChange: onSupplierChange,
          options: [
            { value: "ALL", label: "All suppliers" },
            ...suppliers.map((supplier) => ({ value: supplier.id, label: supplier.name })),
          ],
        },
        {
          type: "daterange",
          label: "Received",
          value: dateRange,
          onChange: onDateRangeChange,
        },
      ]}
      actions={
        canReceive ? (
          <Button leftSection={<IconPlus size={16} />} onClick={onNew}>
            Record receipt
          </Button>
        ) : undefined
      }
    />
  );
}
