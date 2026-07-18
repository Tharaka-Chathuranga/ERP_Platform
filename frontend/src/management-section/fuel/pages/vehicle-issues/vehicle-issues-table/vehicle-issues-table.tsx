import { EmptyState } from "@ui/feedback/EmptyState";
import { DataTable } from "@ui/data";
import type { VehicleFuelIssue } from "@core/types";
import { buildVehicleIssuesColumns } from "./vehicle-issues-columns";

interface VehicleIssuesTableProps {
  data: VehicleFuelIssue[];
  loading: boolean;
  error: unknown;
  vehicleNumber: (id: string) => string;
  userName: (id: string) => string;
  kmPerLitreById: Map<string, number>;
}

export function VehicleIssuesTable({
  data,
  loading,
  error,
  vehicleNumber,
  userName,
  kmPerLitreById,
}: VehicleIssuesTableProps) {
  const columns = buildVehicleIssuesColumns({ vehicleNumber, userName, kmPerLitreById });

  return (
    <DataTable
      columns={columns}
      data={data}
      rowKey={(i) => i.id}
      loading={loading}
      error={error}
      empty={<EmptyState title="No fuel issues" description="No vehicle fuel issues match the current filter." />}
    />
  );
}
