import { EmptyState } from "@ui/feedback/EmptyState";
import { DataTable } from "@ui/data";
import type { Supplier } from "@core/types";
import { buildSupplierColumns } from "./suppliers-columns";

interface SuppliersTableProps {
  data: Supplier[];
  loading: boolean;
  error: unknown;
  activeRowKey?: string;
  onRowClick: (supplier: Supplier) => void;
  canManage: boolean;
  togglePending: boolean;
  onToggle: (supplier: Supplier) => void;
}

export function SuppliersTable({
  data,
  loading,
  error,
  activeRowKey,
  onRowClick,
  canManage,
  togglePending,
  onToggle,
}: SuppliersTableProps) {
  const columns = buildSupplierColumns({ canManage, togglePending, onToggle });

  return (
    <DataTable
      columns={columns}
      data={data}
      rowKey={(s) => s.id}
      onRowClick={onRowClick}
      activeRowKey={activeRowKey}
      loading={loading}
      error={error}
      empty={<EmptyState title="No suppliers" />}
    />
  );
}
