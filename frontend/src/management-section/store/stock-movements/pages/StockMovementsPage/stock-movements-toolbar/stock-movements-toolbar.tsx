import { TableToolbar } from "@ui/data";
import type { Period } from "../../../utils/movementStats";

const PERIODS: { label: string; value: Period }[] = [
  { label: "This week", value: "week" },
  { label: "This month", value: "month" },
];

interface StockMovementsToolbarProps {
  period: Period;
  onPeriodChange: (value: Period) => void;
}

export function StockMovementsToolbar({ period, onPeriodChange }: StockMovementsToolbarProps) {
  return (
    <TableToolbar
      filters={[{
        label: "Period",
        value: period,
        onChange: (v) => onPeriodChange(v as Period),
        options: PERIODS,
      }]}
    />
  );
}
