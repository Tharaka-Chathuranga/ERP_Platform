import { type Column } from "@ui/data";
import { StatusBadge } from "@ui/feedback/StatusBadge";
import type { LowStockItem } from "@core/types";

export function buildWarningsColumns(): Column<LowStockItem>[] {
  return [
    { header: "Code", render: (r) => r.itemCode, emphasis: true },
    { header: "Name", render: (r) => r.name },
    { header: "On hand", render: (r) => `${r.quantityOnHand} ${r.unitOfMeasure}`, align: "right" },
    { header: "Reorder", render: (r) => r.reorderLevel, align: "right" },
    {
      header: "Short by",
      align: "right",
      render: (r) => Number((r.reorderLevel - r.quantityOnHand).toFixed(4)),
    },
    { header: "Flag", render: (r) => (r.criticalItem ? <StatusBadge status="CRITICAL" /> : "—") },
  ];
}
