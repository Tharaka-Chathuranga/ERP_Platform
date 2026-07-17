import { useNavigate } from "react-router-dom";
import { PageHeader } from "@ui/layout/PageHeader";
import { useCan } from "@auth/useCan";
import { FUEL_VIEW } from "@auth/permissions";
import { useVehicleIssues } from "./hooks/use-vehicle-issues";
import { VehicleIssuesToolbar } from "./vehicle-issues-toolbar";
import { VehicleIssuesTable } from "./vehicle-issues-table";

export function VehicleIssuesPage() {
  const navigate = useNavigate();
  const can = useCan();
  const canCreate = can(FUEL_VIEW);

  const {
    search,
    setSearch,
    dateRange,
    setDateRange,
    vehicleId,
    setVehicleId,
    query,
    filteredIssues,
    vehicleNumber,
    userName,
    kmPerLitreById,
    vehicleFilterOptions,
  } = useVehicleIssues();

  return (
    <div>
      <PageHeader title="Vehicle fuel issues" />

      <VehicleIssuesToolbar
        search={search}
        onSearchChange={setSearch}
        dateRange={dateRange}
        onDateRangeChange={setDateRange}
        vehicleId={vehicleId}
        onVehicleChange={setVehicleId}
        vehicleFilterOptions={vehicleFilterOptions}
        canCreate={canCreate}
        onCreate={() => navigate("/fuel/issues/new")}
      />

      <VehicleIssuesTable
        data={filteredIssues}
        loading={query.isLoading}
        error={query.error}
        vehicleNumber={vehicleNumber}
        userName={userName}
        kmPerLitreById={kmPerLitreById}
      />
    </div>
  );
}
