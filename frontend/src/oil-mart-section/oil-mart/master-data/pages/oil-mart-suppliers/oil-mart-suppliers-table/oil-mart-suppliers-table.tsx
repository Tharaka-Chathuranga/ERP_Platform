import { DataTable } from "@ui/data";
import { EmptyState } from "@ui/feedback/EmptyState";
import type { OilMartSupplier } from "@core/types";
import { buildOilMartSuppliersColumns } from "./oil-mart-suppliers-columns";

interface OilMartSuppliersTableProps {
  data: OilMartSupplier[];
  loading?: boolean;
  error?: unknown;
  canManage: boolean;
  onEdit: (supplier: OilMartSupplier) => void;
}

export function OilMartSuppliersTable({
  data,
  loading,
  error,
  canManage,
  onEdit,
}: OilMartSuppliersTableProps) {
  return (
    <DataTable
      columns={buildOilMartSuppliersColumns(canManage, onEdit)}
      data={data}
      rowKey={(supplier) => supplier.id}
      loading={loading}
      error={error}
      empty={
        <EmptyState
          title="No suppliers"
          description="Add the suppliers this oil mart buys stock from."
        />
      }
    />
  );
}
