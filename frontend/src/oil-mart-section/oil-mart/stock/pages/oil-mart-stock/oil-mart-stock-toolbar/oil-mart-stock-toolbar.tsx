import { Button } from "@mantine/core";
import { IconPackageImport } from "@tabler/icons-react";
import { TableToolbar } from "@ui/data";
import { OIL_TYPE_OPTIONS } from "../../../../components/oil-type-badge";

const STOCK_LEVEL_ALL = "ALL";
const STOCK_LEVEL_BELOW_REORDER = "BELOW_REORDER";

const STOCK_LEVEL_OPTIONS = [
  { value: STOCK_LEVEL_ALL, label: "All stock levels" },
  { value: STOCK_LEVEL_BELOW_REORDER, label: "Below reorder level" },
];

interface OilMartStockToolbarProps {
  search: string;
  onSearchChange: (value: string) => void;
  oilType: string;
  onOilTypeChange: (value: string) => void;
  lowOnly: boolean;
  onLowOnlyChange: (value: boolean) => void;
  canAdjust: boolean;
  onRestock: () => void;
}

export function OilMartStockToolbar({
  search,
  onSearchChange,
  oilType,
  onOilTypeChange,
  lowOnly,
  onLowOnlyChange,
  canAdjust,
  onRestock,
}: OilMartStockToolbarProps) {
  return (
    <TableToolbar
      search={{ value: search, onChange: onSearchChange, placeholder: "Search code or name" }}
      filters={[
        {
          label: "Oil type",
          value: oilType,
          onChange: onOilTypeChange,
          options: [{ value: "ALL", label: "All types" }, ...OIL_TYPE_OPTIONS],
        },
        {
          label: "Stock level",
          value: lowOnly ? STOCK_LEVEL_BELOW_REORDER : STOCK_LEVEL_ALL,
          onChange: (value) => onLowOnlyChange(value === STOCK_LEVEL_BELOW_REORDER),
          options: STOCK_LEVEL_OPTIONS,
        },
      ]}
      actions={
        canAdjust && (
          <Button leftSection={<IconPackageImport size={18} />} onClick={onRestock}>
            Restock
          </Button>
        )
      }
    />
  );
}
