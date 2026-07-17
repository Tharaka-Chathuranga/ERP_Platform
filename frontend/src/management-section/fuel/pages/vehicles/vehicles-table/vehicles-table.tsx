import { EmptyState } from "@ui/feedback/EmptyState";
import { DataTable } from "@ui/data";
import type { Vehicle } from "@core/types";
import { buildVehiclesColumns } from "./vehicles-columns";

interface VehiclesTableProps {
  data: Vehicle[];
  loading: boolean;
  error: unknown;
  canManage: boolean;
  userName: (id?: string) => string;
  onEdit: (vehicle: Vehicle) => void;
  onRowClick?: (vehicle: Vehicle) => void;
}

export function VehiclesTable({
  data,
  loading,
  error,
  canManage,
  userName,
  onEdit,
  onRowClick,
}: VehiclesTableProps) {
  const columns = buildVehiclesColumns({ canManage, userName, onEdit });

  return (
    <DataTable
      columns={columns}
      data={data}
      rowKey={(v) => v.id}
      loading={loading}
      error={error}
      empty={<EmptyState title="No vehicles" description="Add a vehicle to start issuing fuel." />}
      onRowClick={onRowClick}
    />
  );
}
