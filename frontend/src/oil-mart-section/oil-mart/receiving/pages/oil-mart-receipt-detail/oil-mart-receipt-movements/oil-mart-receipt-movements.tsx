import { Card, Text, Title } from "@mantine/core";
import dayjs from "dayjs";
import { DataTable, type Column } from "@ui/data";
import { EmptyState } from "@ui/feedback/EmptyState";
import type { OilMartStockMovement } from "@core/types";

function buildColumns(itemNameById: Map<string, string>): Column<OilMartStockMovement>[] {
  return [
    { header: "Oil", emphasis: true, render: (m) => itemNameById.get(m.itemId) ?? m.itemId },
    {
      header: "Change",
      align: "right",
      render: (m) => (
        <Text size="sm" fw={600} c={m.quantityDelta < 0 ? "red" : "teal"}>
          {m.quantityDelta > 0 ? "+" : ""}
          {m.quantityDelta.toLocaleString()} L
        </Text>
      ),
    },
    {
      header: "Balance after",
      align: "right",
      render: (m) => `${m.balanceAfter.toLocaleString()} L`,
    },
    { header: "Recorded", render: (m) => dayjs(m.movedAt).format("MMM D, YYYY h:mm A") },
  ];
}

interface OilMartReceiptMovementsProps {
  movements: OilMartStockMovement[];
  itemNameById: Map<string, string>;
  loading?: boolean;
  error?: unknown;
}

export function OilMartReceiptMovements({
  movements,
  itemNameById,
  loading,
  error,
}: OilMartReceiptMovementsProps) {
  return (
    <Card withBorder radius="md" padding="lg">
      <Title order={4} mb={4}>
        Stock movements
      </Title>
      <Text size="sm" c="dimmed" mb="md">
        The ledger entries this receipt produced.
      </Text>
      <DataTable
        columns={buildColumns(itemNameById)}
        data={movements}
        rowKey={(m) => m.id}
        loading={loading}
        error={error}
        withCard={false}
        empty={<EmptyState title="No movements" description="This receipt has no ledger entries." />}
      />
    </Card>
  );
}
