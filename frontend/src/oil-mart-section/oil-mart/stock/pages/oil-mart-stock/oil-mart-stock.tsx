import { Stack } from "@mantine/core";
import { PageHeader } from "@ui/layout/PageHeader";
import { useCan } from "@auth/useCan";
import { OILMART_STOCK_ADJUST } from "@auth/permissions";
import { StockAdjustmentModal } from "../../components/stock-adjustment-modal";
import { useOilMartStock } from "./hooks/use-oil-mart-stock";
import { OilMartStockStats } from "./oil-mart-stock-stats";
import { OilMartStockToolbar } from "./oil-mart-stock-toolbar";
import { OilMartStockTable } from "./oil-mart-stock-table";

export function OilMartStockPage() {
  const can = useCan();
  const canAdjust = can(OILMART_STOCK_ADJUST);

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
    openItem,
    items,
    adjustmentOpen,
    adjustingItemId,
    openAdjustment,
    closeAdjustment,
    adjust,
  } = useOilMartStock();

  return (
    <div>
      <PageHeader title="Oil mart stock" />

      <Stack gap="lg">
        <OilMartStockStats
          stockValue={totals.stockValue}
          lowCount={totals.lowCount}
          lowOnly={lowOnly}
          onShowLowOnly={() => setLowOnly(true)}
        />

        <div>
          <OilMartStockToolbar
            search={search}
            onSearchChange={setSearch}
            oilType={oilType}
            onOilTypeChange={setOilType}
            lowOnly={lowOnly}
            onLowOnlyChange={setLowOnly}
            canAdjust={canAdjust}
            onRestock={() => openAdjustment()}
          />

          <OilMartStockTable
            data={balances}
            loading={query.isLoading}
            error={query.error}
            onRowClick={openItem}
          />
        </div>
      </Stack>

      <StockAdjustmentModal
        opened={adjustmentOpen}
        items={items}
        balances={query.data ?? []}
        defaultItemId={adjustingItemId}
        submitting={adjust.isPending}
        onClose={closeAdjustment}
        onSubmit={(values) => adjust.mutate(values)}
      />
    </div>
  );
}
