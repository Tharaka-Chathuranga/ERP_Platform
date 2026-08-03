import { Anchor, Breadcrumbs, Stack } from "@mantine/core";
import { Link } from "react-router-dom";
import { PageHeader } from "@ui/layout/PageHeader";
import { QueryBoundary } from "@ui/feedback/QueryBoundary";
import { useCan } from "@auth/useCan";
import { OILMART_PRICE_MANAGE, OILMART_STOCK_ADJUST } from "@auth/permissions";
import { StockAdjustmentModal, StockMovementsCard } from "../../../stock/components";
import { AddItemPriceModal } from "../../components/add-item-price-modal";
import { useOilMartItemDetail } from "./hooks/use-oil-mart-item-detail";
import { OilMartItemSummaryCard } from "./oil-mart-item-summary-card";
import { OilMartItemPriceHistory } from "./oil-mart-item-price-history";

export function OilMartItemDetailPage() {
  const can = useCan();
  const canManagePrices = can(OILMART_PRICE_MANAGE);
  const canAdjust = can(OILMART_STOCK_ADJUST);

  const {
    itemId,
    itemQuery,
    pricesQuery,
    movementsQuery,
    stockQuery,
    balance,
    currentPrice,
    priceModalOpen,
    setPriceModalOpen,
    addPrice,
    adjustmentOpen,
    setAdjustmentOpen,
    adjust,
  } = useOilMartItemDetail();

  return (
    <div>
      <Breadcrumbs mb="sm">
        <Anchor component={Link} to="/oil-mart/items" size="sm">
          Oils
        </Anchor>
        <Anchor size="sm" c="dimmed">
          {itemQuery.data?.code ?? "…"}
        </Anchor>
      </Breadcrumbs>

      <PageHeader title={itemQuery.data?.name ?? "Oil"} />

      <QueryBoundary loading={itemQuery.isLoading} error={itemQuery.error}>
        {itemQuery.data && (
          <>
            <OilMartItemSummaryCard
              item={itemQuery.data}
              balance={balance}
              currentPrice={currentPrice}
            />

            <Stack gap="lg">
              <StockMovementsCard
                data={movementsQuery.data ?? []}
                loading={movementsQuery.isLoading}
                error={movementsQuery.error}
                canAdjust={canAdjust}
                onRestock={() => setAdjustmentOpen(true)}
              />

              <OilMartItemPriceHistory
                data={pricesQuery.data ?? []}
                loading={pricesQuery.isLoading}
                error={pricesQuery.error}
                canManage={canManagePrices}
                onAdd={() => setPriceModalOpen(true)}
              />
            </Stack>

            <AddItemPriceModal
              opened={priceModalOpen}
              currentPrice={currentPrice}
              submitting={addPrice.isPending}
              onClose={() => setPriceModalOpen(false)}
              onSubmit={(values) => addPrice.mutate(values)}
            />

            <StockAdjustmentModal
              opened={adjustmentOpen}
              items={[itemQuery.data]}
              balances={stockQuery.data ?? []}
              defaultItemId={itemId}
              submitting={adjust.isPending}
              onClose={() => setAdjustmentOpen(false)}
              onSubmit={(values) => adjust.mutate(values)}
            />
          </>
        )}
      </QueryBoundary>
    </div>
  );
}
