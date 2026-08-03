import { PageHeader } from "@ui/layout/PageHeader";
import { useOilMartStock } from "./hooks/use-oil-mart-stock";
import { OilMartStockToolbar } from "./oil-mart-stock-toolbar";
import { OilMartStockTable } from "./oil-mart-stock-table";
import { OilMartMovementDrawer } from "./oil-mart-movement-drawer";

export function OilMartStockPage() {
  const {
    query,
    balances,
    totals,
    search,
    setSearch,
    oilType,
    setOilType,
    lowOnly,
    setLowOnly,
    selected,
    setSelected,
    movementsQuery,
  } = useOilMartStock();

  return (
    <div>
      <PageHeader title="Oil mart stock" />

      <OilMartStockToolbar
        search={search}
        onSearchChange={setSearch}
        oilType={oilType}
        onOilTypeChange={setOilType}
        lowOnly={lowOnly}
        onLowOnlyChange={setLowOnly}
        stockValue={totals.stockValue}
        lowCount={totals.lowCount}
      />

      <OilMartStockTable
        data={balances}
        loading={query.isLoading}
        error={query.error}
        activeItemId={selected?.itemId}
        onRowClick={setSelected}
      />

      <OilMartMovementDrawer
        balance={selected}
        movements={movementsQuery.data ?? []}
        loading={movementsQuery.isLoading}
        error={movementsQuery.error}
        onClose={() => setSelected(null)}
      />
    </div>
  );
}
