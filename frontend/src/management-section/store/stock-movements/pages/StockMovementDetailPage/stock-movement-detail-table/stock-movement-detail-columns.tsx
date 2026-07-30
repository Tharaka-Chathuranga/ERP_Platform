import dayjs from "dayjs";
import { Badge } from "@mantine/core";
import { type Column } from "@ui/data";
import type { MovementType, StockMovement } from "@core/types";
import { isOutbound } from "../../../utils/movementStats";

function MovementTypeBadge({ type }: { type: MovementType }) {
  return (
    <Badge color={isOutbound(type) ? "red" : "green"} variant="light" radius="sm">
      {type.replace(/_/g, " ")}
    </Badge>
  );
}

interface StockMovementDetailColumnsOptions {
  itemCode: (id: string) => string;
}

export function buildStockMovementDetailColumns({ itemCode }: StockMovementDetailColumnsOptions): Column<StockMovement>[] {
  return [
    { header: "Item code", emphasis: true, render: (m) => itemCode(m.itemId) },
    { header: "Type", render: (m) => <MovementTypeBadge type={m.type} /> },
    { header: "Quantity", align: "right", render: (m) => m.quantity.toLocaleString() },
    { header: "Unit cost", align: "right", render: (m) => m.unitCost ?? "—" },
    { header: "Reference", render: (m) => m.reference || "—" },
    { header: "When", render: (m) => dayjs(m.occurredAt).format("YYYY-MM-DD HH:mm") },
  ];
}
