import { Progress, Stack, Text } from "@mantine/core";
import dayjs from "dayjs";
import type { Column } from "@ui/data";
import { StackedCell } from "@ui/data";
import type { OilMartStockBalance } from "@core/types";
import { OilTypeBadge } from "../../../../components/oil-type-badge";
import { MoneyText } from "../../../../components/money-text";

export function isLowStock(balance: OilMartStockBalance): boolean {
  return balance.quantityOnHand < balance.reorderLevelLitres;
}

export function buildOilMartStockColumns(): Column<OilMartStockBalance>[] {
  return [
    {
      header: "Oil",
      emphasis: true,
      render: (balance) => (
        <StackedCell primary={balance.itemName} secondary={balance.itemCode} />
      ),
    },
    { header: "Type", render: (balance) => <OilTypeBadge oilType={balance.oilType} /> },
    {
      header: "On hand",
      align: "right",
      render: (balance) => {
        const low = isLowStock(balance);
        const ratio = Math.min(
          (balance.quantityOnHand / (balance.reorderLevelLitres || 1)) * 100,
          100,
        );
        return (
          <Stack gap={4} align="flex-end" style={{ minWidth: 120 }}>
            <Text size="sm" fw={700} c={low ? "red" : undefined} style={{ fontVariantNumeric: "tabular-nums" }}>
              {balance.quantityOnHand.toLocaleString()} L
            </Text>
            <Progress value={ratio} color={low ? "red" : "teal"} size="xs" w="100%" radius="xl" />
          </Stack>
        );
      },
    },
    {
      header: "Reorder level",
      align: "right",
      render: (balance) => `${balance.reorderLevelLitres.toLocaleString()} L`,
    },
    { header: "Buy price", align: "right", render: (balance) => <MoneyText value={balance.buyPrice} /> },
    { header: "Sell price", align: "right", render: (balance) => <MoneyText value={balance.sellPrice} /> },
    {
      header: "Stock value",
      align: "right",
      render: (balance) => <MoneyText value={balance.stockValue} emphasis />,
    },
    {
      header: "Last movement",
      render: (balance) =>
        balance.lastMovementAt ? dayjs(balance.lastMovementAt).format("MMM D, YYYY") : "—",
    },
  ];
}
