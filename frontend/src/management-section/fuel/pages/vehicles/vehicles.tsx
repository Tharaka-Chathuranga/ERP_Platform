import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { PageHeader } from "@ui/layout/PageHeader";
import { useCan } from "@auth/useCan";
import { DASHBOARD_ADMIN, FUEL_MANAGE } from "@auth/permissions";
import type { Vehicle } from "@core/types";
import { VehicleFormModal } from "../../components/vehicle-form-modal";
import { useVehicles } from "./use-vehicles";
import { VehiclesToolbar } from "./vehicles-toolbar";
import { VehiclesTable } from "./vehicles-table";

export function VehiclesPage() {
  const navigate = useNavigate();
  const can = useCan();
  const canManage = can(FUEL_MANAGE);
  const canViewEfficiency = can(DASHBOARD_ADMIN);

  const { search, setSearch, statusFilter, setStatusFilter, query, filteredVehicles, userName } =
    useVehicles();

  const [createOpen, setCreateOpen] = useState(false);
  const [editing, setEditing] = useState<Vehicle | undefined>();

  return (
    <div>
      <PageHeader title="Vehicles" />

      <VehiclesToolbar
        search={search}
        onSearchChange={setSearch}
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
        canManage={canManage}
        onCreate={() => setCreateOpen(true)}
      />

      <VehiclesTable
        data={filteredVehicles}
        loading={query.isLoading}
        error={query.error}
        canManage={canManage}
        userName={userName}
        onEdit={setEditing}
        onRowClick={canViewEfficiency ? (v) => navigate(`/fuel/efficiency/${v.id}`) : undefined}
      />

      <VehicleFormModal opened={createOpen} onClose={() => setCreateOpen(false)} />
      <VehicleFormModal opened={!!editing} onClose={() => setEditing(undefined)} vehicle={editing} />
    </div>
  );
}
