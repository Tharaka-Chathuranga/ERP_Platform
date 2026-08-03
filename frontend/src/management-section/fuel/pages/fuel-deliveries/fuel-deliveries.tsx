import { useNavigate } from "react-router-dom";
import { PageHeader } from "@ui/layout/PageHeader";
import { useCan } from "@auth/useCan";
import { FUEL_VIEW } from "@auth/permissions";
import { useFuelDeliveries } from "./hooks/use-fuel-deliveries";
import { FuelDeliveriesToolbar } from "./fuel-deliveries-toolbar";
import { FuelDeliveriesTable } from "./fuel-deliveries-table";
import { DeliveryDetailModal } from "./delivery-detail-modal";

export function FuelDeliveriesPage() {
  const navigate = useNavigate();
  const can = useCan();
  const canCreate = can(FUEL_VIEW);

  const {
    query,
    filtered,
    tankName,
    userName,
    search,
    setSearch,
    dateRange,
    setDateRange,
    detail,
    setDetail,
  } = useFuelDeliveries();

  return (
    <div>
      <PageHeader title="Fuel deliveries" />

      <FuelDeliveriesToolbar
        search={search}
        onSearchChange={setSearch}
        dateRange={dateRange}
        onDateRangeChange={setDateRange}
        canCreate={canCreate}
        onCreate={() => navigate("/fuel/deliveries/new")}
      />

      <FuelDeliveriesTable
        data={filtered}
        loading={query.isLoading}
        error={query.error}
        tankName={tankName}
        userName={userName}
        onRowClick={setDetail}
      />

      <DeliveryDetailModal
        delivery={detail}
        tankName={tankName}
        userName={userName}
        onClose={() => setDetail(undefined)}
      />
    </div>
  );
}
