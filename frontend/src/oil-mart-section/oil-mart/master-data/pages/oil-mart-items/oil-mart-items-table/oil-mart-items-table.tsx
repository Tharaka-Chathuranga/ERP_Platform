import { DataTable } from "@ui/data";
import { EmptyState } from "@ui/feedback/EmptyState";
import type { OilMartItem, OilMartStockBalance } from "@core/types";
import { buildOilMartItemsColumns } from "./oil-mart-items-columns";

interface OilMartItemsTableProps {
  data: OilMartItem[];
  stock?: OilMartStockBalance[];
  loading?: boolean;
  error?: unknown;
  onRowClick?: (item: OilMartItem) => void;
}

export function OilMartItemsTable({
  data,
  stock,
  loading,
  error,
  onRowClick,
}: OilMartItemsTableProps) {
  return (
    <DataTable
      columns={buildOilMartItemsColumns(stock)}
      data={data}
      rowKey={(item) => item.id}
      loading={loading}
      error={error}
      onRowClick={onRowClick}
      rowBg={(item) => {
        const balance = stock?.find((s) => s.itemId === item.id);
        return balance && balance.quantityOnHand < balance.reorderLevelLitres
          ? "var(--mantine-color-red-light)"
          : undefined;
      }}
      empty={
        <EmptyState
          title="No oils"
          description="Add the oil types this mart sells to get started."
        />
      }
    />
  );
}
