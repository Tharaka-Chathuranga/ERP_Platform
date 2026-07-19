import { EmptyState } from "@ui/feedback/EmptyState";
import { DataTable } from "@ui/data";
import type { FuelDelivery } from "@core/types";
import { buildFuelDeliveriesColumns } from "./fuel-deliveries-columns";

interface FuelDeliveriesTableProps {
  data: FuelDelivery[];
  loading: boolean;
  error: unknown;
  tankName: (id: string) => string;
  userName: (id: string) => string;
  onRowClick: (delivery: FuelDelivery) => void;
}

export function FuelDeliveriesTable({
  data,
  loading,
  error,
  tankName,
  userName,
  onRowClick,
}: FuelDeliveriesTableProps) {
  const columns = buildFuelDeliveriesColumns({ tankName, userName });

  return (
    <DataTable
      columns={columns}
      data={data}
      rowKey={(d) => d.id}
      onRowClick={onRowClick}
      loading={loading}
      error={error}
      empty={<EmptyState title="No fuel deliveries" description="No deliveries match the current filter." />}
    />
  );
}
