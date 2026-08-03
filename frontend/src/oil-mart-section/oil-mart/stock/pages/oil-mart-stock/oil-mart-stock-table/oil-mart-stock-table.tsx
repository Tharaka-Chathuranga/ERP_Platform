import { DataTable } from "@ui/data";
import { EmptyState } from "@ui/feedback/EmptyState";
import type { OilMartStockBalance } from "@core/types";
import { buildOilMartStockColumns, isLowStock } from "./oil-mart-stock-columns";

interface OilMartStockTableProps {
  data: OilMartStockBalance[];
  loading?: boolean;
  error?: unknown;
  onRowClick?: (balance: OilMartStockBalance) => void;
}

export function OilMartStockTable({
  data,
  loading,
  error,
  onRowClick,
}: OilMartStockTableProps) {
  return (
    <DataTable
      columns={buildOilMartStockColumns()}
      data={data}
      rowKey={(balance) => balance.itemId}
      loading={loading}
      error={error}
      onRowClick={onRowClick}
      rowBg={(balance) => (isLowStock(balance) ? "var(--mantine-color-red-light)" : undefined)}
      empty={
        <EmptyState
          title="No stock"
          description="Record an oil receipt to build up stock balances."
        />
      }
    />
  );
}
