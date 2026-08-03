import { Anchor } from "@mantine/core";
import { Link } from "react-router-dom";
import { IconAlertTriangle } from "@tabler/icons-react";
import { DataTable, StackedCell, type Column } from "@ui/data";
import { OverviewCard } from "@ui/layout/OverviewCard";
import { EmptyState } from "@ui/feedback/EmptyState";
import type { OilMartStockBalance } from "@core/types";

function buildColumns(expanded: boolean): Column<OilMartStockBalance>[] {
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
    ...(expanded
      ? [
          {
            header: "Shortfall",
            align: "right" as const,
            render: (balance: OilMartStockBalance) =>
              `${Math.max(
                balance.reorderLevelLitres - balance.quantityOnHand,
                0,
              ).toLocaleString()} L`,
          },
        ]
      : []),
  ];
}

interface OilMartLowStockPanelProps {
  balances: OilMartStockBalance[];
  onSelect?: (balance: OilMartStockBalance) => void;
}

export function OilMartLowStockPanel({ balances, onSelect }: OilMartLowStockPanelProps) {
  return (
    <OverviewCard
      title="Below reorder level"
      description="Oils to restock"
      icon={<IconAlertTriangle size={22} />}
      accent="red"
      count={balances.length}
      action={
        <Anchor component={Link} to="/oil-mart/stock" size="sm">
          All stock
        </Anchor>
      }
    >
      {(expanded) => (
        <DataTable
          columns={buildColumns(expanded)}
          data={balances}
          rowKey={(balance) => balance.itemId}
          onRowClick={onSelect}
          withCard={false}
          rowBg={() => "var(--mantine-color-red-light)"}
          empty={
            <EmptyState title="All stocked" description="Every oil is above its reorder level." />
          }
        />
      )}
    </OverviewCard>
  );
}
