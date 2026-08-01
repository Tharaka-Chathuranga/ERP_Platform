import { Anchor, Card, Group, Title } from "@mantine/core";
import { Link } from "react-router-dom";
import { DataTable, StackedCell, type Column } from "@ui/data";
import { EmptyState } from "@ui/feedback/EmptyState";
import type { OilMartStockBalance } from "@core/types";

function buildColumns(): Column<OilMartStockBalance>[] {
  return [
    {
      header: "Oil",
      emphasis: true,
      render: (balance) => (
        <StackedCell primary={balance.itemName} secondary={balance.itemCode} />
      ),
    },
    {
      header: "On hand",
      align: "right",
      render: (balance) => `${balance.quantityOnHand.toLocaleString()} L`,
    },
    {
      header: "Reorder at",
      align: "right",
      render: (balance) => `${balance.reorderLevelLitres.toLocaleString()} L`,
    },
  ];
}

interface OilMartLowStockPanelProps {
  balances: OilMartStockBalance[];
  onSelect?: (balance: OilMartStockBalance) => void;
}

export function OilMartLowStockPanel({ balances, onSelect }: OilMartLowStockPanelProps) {
  return (
    <Card withBorder radius="md" padding="lg">
      <Group justify="space-between" mb="md">
        <Title order={4}>Below reorder level</Title>
        <Anchor component={Link} to="/oil-mart/stock" size="sm">
          All stock
        </Anchor>
      </Group>
      <DataTable
        columns={buildColumns()}
        data={balances}
        rowKey={(balance) => balance.itemId}
        onRowClick={onSelect}
        withCard={false}
        rowBg={() => "var(--mantine-color-red-light)"}
        empty={<EmptyState title="All stocked" description="Every oil is above its reorder level." />}
      />
    </Card>
  );
}
