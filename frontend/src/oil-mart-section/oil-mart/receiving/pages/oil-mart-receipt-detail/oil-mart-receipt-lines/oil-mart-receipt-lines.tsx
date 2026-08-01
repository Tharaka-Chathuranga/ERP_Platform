import { Card, Title } from "@mantine/core";
import { DataTable, StackedCell, type Column } from "@ui/data";
import type { OilMartReceiptLine } from "@core/types";
import { MoneyText } from "../../../../components/money-text";

function buildColumns(): Column<OilMartReceiptLine>[] {
  return [
    {
      header: "Oil",
      emphasis: true,
      render: (line) => <StackedCell primary={line.itemName} secondary={line.itemCode} />,
    },
    {
      header: "Quantity",
      align: "right",
      render: (line) => `${line.quantityLitres.toLocaleString()} L`,
    },
    { header: "Buy price", align: "right", render: (line) => <MoneyText value={line.buyUnitPrice} /> },
    { header: "Line total", align: "right", render: (line) => <MoneyText value={line.lineTotal} emphasis /> },
  ];
}

export function OilMartReceiptLines({ lines }: { lines: OilMartReceiptLine[] }) {
  return (
    <Card withBorder radius="md" padding="lg" mb="lg">
      <Title order={4} mb="md">
        Lines
      </Title>
      <DataTable
        columns={buildColumns()}
        data={lines}
        rowKey={(line) => line.id}
        withCard={false}
      />
    </Card>
  );
}
