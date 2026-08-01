import { Badge, Text } from "@mantine/core";
import dayjs from "dayjs";
import type { Column } from "@ui/data";
import { StackedCell } from "@ui/data";
import type { OilMartMovementType, OilMartStockMovement } from "@core/types";

const MOVEMENT_COLORS: Record<OilMartMovementType, string> = {
  RECEIPT: "teal",
  SALE: "grape",
  ADJUSTMENT: "orange",
};

const MOVEMENT_LABELS: Record<OilMartMovementType, string> = {
  RECEIPT: "Receipt",
  SALE: "Sale",
  ADJUSTMENT: "Adjustment",
};

export function buildOilMartMovementColumns(): Column<OilMartStockMovement>[] {
  return [
    {
      header: "Type",
      render: (movement) => (
        <Badge color={MOVEMENT_COLORS[movement.movementType]} variant="light" radius="sm">
          {MOVEMENT_LABELS[movement.movementType]}
        </Badge>
      ),
    },
    {
      header: "Reference",
      render: (movement) => (
        <StackedCell
          primary={movement.referenceNo ?? "Manual"}
          secondary={movement.note ?? undefined}
        />
      ),
    },
    {
      header: "Change",
      align: "right",
      emphasis: true,
      render: (movement) => (
        <Text size="sm" fw={700} c={movement.quantityDelta < 0 ? "red" : "teal"} style={{ fontVariantNumeric: "tabular-nums" }}>
          {movement.quantityDelta > 0 ? "+" : ""}
          {movement.quantityDelta.toLocaleString()} L
        </Text>
      ),
    },
    {
      header: "Balance after",
      align: "right",
      render: (movement) => (
        <Text size="sm" style={{ fontVariantNumeric: "tabular-nums" }}>
          {movement.balanceAfter.toLocaleString()} L
        </Text>
      ),
    },
    { header: "When", render: (movement) => dayjs(movement.movedAt).format("MMM D, YYYY h:mm A") },
  ];
}
