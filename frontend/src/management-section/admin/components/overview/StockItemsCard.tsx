import { Badge, Group, Stack, Text } from "@mantine/core";
import { useMemo, useState, type ReactNode } from "react";
import { DataTable, TableToolbar, type Column } from "@ui/data";
import { StatusBadge } from "@ui/feedback/StatusBadge";
import type { ItemStockRow } from "@core/types";
import { OverviewCard } from "./OverviewCard";
import { money } from "./format";

const STOCK_LEVEL_OPTIONS = [
  { value: "ALL", label: "All stock levels" },
  { value: "LOW", label: "Below reorder" },
  { value: "OK", label: "At / above reorder" },
];

interface StockItemsCardProps {
  title: string;
  description?: string;
  icon: ReactNode;
  accent: string;
  items: ItemStockRow[] | undefined;
  total: number;
  loading?: boolean;
  error?: unknown;
  emptyText: string;
  showPrice?: boolean;
  showStatus?: boolean;
  filterByStockLevel?: boolean;
}

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
  filterByStockLevel = true,
}: StockItemsCardProps) {
  const [search, setSearch] = useState("");
  const [stockLevel, setStockLevel] = useState("ALL");

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return (items ?? []).filter((r) => {
      if (stockLevel === "LOW" && r.quantityOnHand >= r.reorderLevel) return false;
      if (stockLevel === "OK" && r.quantityOnHand < r.reorderLevel) return false;
      if (q && !r.itemCode.toLowerCase().includes(q) && !r.name.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [items, search, stockLevel]);

  const isFiltering = search.trim() !== "" || stockLevel !== "ALL";
  const capped = items != null && items.length < total && !isFiltering;
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
    <OverviewCard
      title={title}
      description={description}
      icon={icon}
      accent={accent}
      count={total}
      toolbar={
        <TableToolbar
          search={{ value: search, onChange: setSearch, placeholder: "Search code or name…" }}
          filters={
            filterByStockLevel
              ? [{ label: "Stock level", value: stockLevel, onChange: setStockLevel, options: STOCK_LEVEL_OPTIONS }]
              : undefined
          }
        />
      }
    >
      <Stack gap="xs">
        <DataTable<ItemStockRow>
          data={items ? filtered : undefined}
          loading={loading}
          error={error}
          withCard={false}
          rowKey={(r) => r.itemId}
          empty={<Text c="dimmed" p="md">{isFiltering ? "No items match your search." : emptyText}</Text>}
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
