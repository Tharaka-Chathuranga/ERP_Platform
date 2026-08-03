import { Text } from "@mantine/core";
import dayjs from "dayjs";
import type { Column } from "@ui/data";
import { StackedCell } from "@ui/data";
import type { OilMartReceipt } from "@core/types";
import { MoneyText } from "../../../../components/money-text";

export function buildOilMartReceiptsColumns(): Column<OilMartReceipt>[] {
  return [
    {
      header: "Receipt",
      emphasis: true,
      render: (receipt) => (
        <StackedCell primary={receipt.receiptNo} secondary={receipt.referenceNo ?? "No reference"} />
      ),
    },
    { header: "Supplier", render: (receipt) => receipt.supplierName },
    {
      header: "Received",
      render: (receipt) => dayjs(receipt.receivedAt).format("MMM D, YYYY h:mm A"),
    },
    {
      header: "Lines",
      align: "right",
      render: (receipt) => (
        <Text size="sm" style={{ fontVariantNumeric: "tabular-nums" }}>
          {receipt.lines.length}
        </Text>
      ),
    },
    {
      header: "Litres",
      align: "right",
      render: (receipt) => (
        <Text size="sm" style={{ fontVariantNumeric: "tabular-nums" }}>
          {receipt.lines.reduce((sum, line) => sum + line.quantityLitres, 0).toLocaleString()} L
        </Text>
      ),
    },
    {
      header: "Total cost",
      align: "right",
      render: (receipt) => <MoneyText value={receipt.totalCost} emphasis />,
    },
  ];
}
