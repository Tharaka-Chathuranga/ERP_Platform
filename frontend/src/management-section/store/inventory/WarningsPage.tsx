import { Text } from "@mantine/core";
import { useQuery } from "@tanstack/react-query";
import { qk } from "@core/queryKeys";
import { DataTable } from "@ui/data/DataTable";
import { StatusBadge } from "@ui/feedback/StatusBadge";
import { PageHeader } from "@ui/layout/PageHeader";
import type { LowStockItem } from "@core/types";
import { getLowStockItems } from "./items.api";

/** Items whose on-hand has dropped below their reorder level. Visible to both roles. */
export function WarningsPage() {
  const { data, isLoading, error } = useQuery({
    queryKey: qk.lowStock(),
    queryFn: getLowStockItems,
  });

  return (
    <div>
      <PageHeader title="Stock warnings" />
      <DataTable<LowStockItem>
        data={data}
        loading={isLoading}
        error={error}
        rowKey={(r) => r.itemId}
        empty={<Text c="dimmed" p="md">Nothing below reorder level — all good.</Text>}
        columns={[
          { header: "Code", render: (r) => r.itemCode, emphasis: true },
          { header: "Name", render: (r) => r.name },
          { header: "On hand", render: (r) => `${r.quantityOnHand} ${r.unitOfMeasure}`, align: "right" },
          { header: "Reorder", render: (r) => r.reorderLevel, align: "right" },
          {
            header: "Short by",
            align: "right",
            render: (r) => Number((r.reorderLevel - r.quantityOnHand).toFixed(4)),
          },
          { header: "Flag", render: (r) => (r.criticalItem ? <StatusBadge status="CRITICAL" /> : "—") },
        ]}
      />
    </div>
  );
}
