import { EmptyState } from "@ui/feedback/EmptyState";
import { DataTable } from "@ui/data";
import type { FuelPrice } from "@core/types";
import { buildFuelPricesColumns } from "./fuel-prices-columns";

interface FuelPricesTableProps {
  data: FuelPrice[];
  loading: boolean;
  error: unknown;
}

export function FuelPricesTable({ data, loading, error }: FuelPricesTableProps) {
  const columns = buildFuelPricesColumns();

  return (
    <DataTable
      columns={columns}
      data={data}
      rowKey={(p) => p.id}
      loading={loading}
      error={error}
      empty={<EmptyState title="No prices" description="Add a fuel price with its date range." />}
    />
  );
}
