import { PageHeader } from "@ui/layout/PageHeader";
import { useCan } from "@auth/useCan";
import { FUEL_MANAGE } from "@auth/permissions";
import { AddPriceModal } from "../../components/add-price-modal";
import { useFuelPrices } from "./hooks/use-fuel-prices";
import { FuelPricesToolbar } from "./fuel-prices-toolbar";
import { FuelPricesTable } from "./fuel-prices-table";

export function FuelPricesPage() {
  const can = useCan();
  const canManage = can(FUEL_MANAGE);

  const { query, filteredPrices, dateRange, setDateRange, addOpen, setAddOpen } = useFuelPrices();

  return (
    <div>
      <PageHeader title="Fuel prices" />

      <FuelPricesToolbar
        dateRange={dateRange}
        onDateRangeChange={setDateRange}
        canManage={canManage}
        onAdd={() => setAddOpen(true)}
      />

      <FuelPricesTable data={filteredPrices} loading={query.isLoading} error={query.error} />

      <AddPriceModal opened={addOpen} onClose={() => setAddOpen(false)} />
    </div>
  );
}
