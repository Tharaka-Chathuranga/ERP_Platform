import { DataTable } from "@ui/data";
import { EmptyState } from "@ui/feedback/EmptyState";
import type { StockMovement } from "@core/types";
import { buildStockMovementDetailColumns } from "./stock-movement-detail-columns";

interface StockMovementDetailTableProps {
  data: StockMovement[];
  loading: boolean;
  error: unknown;
  itemCode: (id: string) => string;
}

export function StockMovementDetailTable({ data, loading, error, itemCode }: StockMovementDetailTableProps) {
  const columns = buildStockMovementDetailColumns({ itemCode });

  return (
    <DataTable
      columns={columns}
      data={data}
      rowKey={(m) => m.id}
      loading={loading}
      error={error}
      empty={
        <EmptyState
          title="No stock movements match"
          description="Adjust the filters, or record receiving and issuing to populate the ledger."
        />
      }
    />
  );
}
