import { DataTable } from "@ui/data";
import { EmptyState } from "@ui/feedback/EmptyState";
import type { OilMartReceipt } from "@core/types";
import { buildOilMartReceiptsColumns } from "./oil-mart-receipts-columns";

interface OilMartReceiptsTableProps {
  data: OilMartReceipt[];
  loading?: boolean;
  error?: unknown;
  onRowClick?: (receipt: OilMartReceipt) => void;
}

export function OilMartReceiptsTable({
  data,
  loading,
  error,
  onRowClick,
}: OilMartReceiptsTableProps) {
  return (
    <DataTable
      columns={buildOilMartReceiptsColumns()}
      data={data}
      rowKey={(receipt) => receipt.id}
      loading={loading}
      error={error}
      onRowClick={onRowClick}
      empty={
        <EmptyState
          title="No receipts"
          description="Record a receipt when oil arrives from a supplier."
        />
      }
    />
  );
}
