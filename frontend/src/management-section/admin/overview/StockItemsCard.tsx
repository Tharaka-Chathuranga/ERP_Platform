import { Badge, Group, Stack, Text } from "@mantine/core";
import type { ReactNode } from "react";
import { DataTable, type Column } from "@ui/data/DataTable";
import { StatusBadge } from "@ui/feedback/StatusBadge";
import type { ItemStockRow } from "@core/types";
import { OverviewCard } from "./OverviewCard";
import { money } from "./format";

interface StockItemsCardProps {
  title: string;
  description?: string;
  icon: ReactNode;
  accent: string;
  items: ItemStockRow[] | undefined;
  /** True total — the list may be capped server-side, so this drives the badge. */
  total: number;
  loading?: boolean;
  error?: unknown;
  emptyText: string;
  /** Adds a unit-price column (used for the critical and normal lists). */
  showPrice?: boolean;
  /** Shows the critical/low status column (off for the critical and normal lists). */
  showStatus?: boolean;
}

/** Renders one stock-health bucket (critical / normal / warning / critical-warning). */
export function StockItemsCard({
  title,
  description,
  icon,
  accent,
  items,
  total,
  loading,
  error,
  emptyText,
  showPrice = false,
  showStatus = true,
}: StockItemsCardProps) {
  const capped = items != null && items.length < total;
  const columns: Column<ItemStockRow>[] = [
    { header: "Code", render: (r) => r.itemCode, emphasis: true },
    { header: "Name", render: (r) => r.name },
    { header: "On hand", render: (r) => `${r.quantityOnHand} ${r.unitOfMeasure}`, align: "right" },
    { header: "Reorder", render: (r) => r.reorderLevel, align: "right" },
    ...(showPrice
      ? [{ header: "Price", render: (r: ItemStockRow) => money(r.unitPrice), align: "right" as const }]
      : []),
    ...(showStatus
      ? [
          {
            header: "Status",
            render: (r: ItemStockRow) => (
              <Group gap={6} wrap="nowrap" justify="flex-end">
                {r.criticalItem && <StatusBadge status="CRITICAL" />}
                {r.quantityOnHand < r.reorderLevel && (
                  <Badge color="orange" variant="light" radius="sm">
                    LOW
                  </Badge>
                )}
              </Group>
            ),
            align: "right" as const,
          },
        ]
      : []),
  ];

  return (
    <OverviewCard title={title} description={description} icon={icon} accent={accent} count={total}>
      <Stack gap="xs">
        <DataTable<ItemStockRow>
          data={items}
          loading={loading}
          error={error}
          withCard={false}
          rowKey={(r) => r.itemId}
          empty={<Text c="dimmed" p="md">{emptyText}</Text>}
          columns={columns}
        />
        {capped && (
          <Text c="dimmed" fz="xs" ta="right">
            Showing {items?.length} of {total}.
          </Text>
        )}
      </Stack>
    </OverviewCard>
  );
}
