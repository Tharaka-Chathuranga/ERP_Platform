import { Text } from "@mantine/core";
import type { Column } from "@ui/data";
import { StackedCell } from "@ui/data";
import { StatusBadge } from "@ui/feedback/StatusBadge";
import type { OilMartItem, OilMartStockBalance } from "@core/types";
import { OilTypeBadge } from "../../../../components/oil-type-badge";
import { MoneyText } from "../../../../components/money-text";

export function buildOilMartItemsColumns(
  stock: OilMartStockBalance[] = [],
): Column<OilMartItem>[] {
  const byItemId = new Map(stock.map((s) => [s.itemId, s]));

  return [
    {
      header: "Oil",
      emphasis: true,
      render: (item) => <StackedCell primary={item.name} secondary={item.code} />,
    },
    { header: "Type", render: (item) => <OilTypeBadge oilType={item.oilType} /> },
    { header: "Brand", render: (item) => item.brand ?? "—" },
    { header: "Grade", render: (item) => item.grade ?? "—" },
    {
      header: "Sell price",
      align: "right",
      render: (item) => <MoneyText value={byItemId.get(item.id)?.sellPrice} />,
    },
    {
      header: "On hand",
      align: "right",
      render: (item) => {
        const balance = byItemId.get(item.id);
        if (!balance) return <Text size="sm" c="dimmed">—</Text>;
        const low = balance.quantityOnHand < balance.reorderLevelLitres;
        return (
          <Text size="sm" fw={600} c={low ? "red" : undefined} style={{ fontVariantNumeric: "tabular-nums" }}>
            {balance.quantityOnHand.toLocaleString()} L
          </Text>
        );
      },
    },
    { header: "Status", render: (item) => <StatusBadge status={item.status} /> },
  ];
}
