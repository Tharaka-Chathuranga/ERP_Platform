import { Grid } from "@mantine/core";
import { PageHeader } from "@ui/layout/PageHeader";
import { QueryBoundary } from "@ui/feedback/QueryBoundary";
import { useOilMartOverview } from "./hooks/use-oil-mart-overview";
import { OilMartOverviewStats } from "./oil-mart-overview-stats";
import { OilMartSalesTrendChart } from "./oil-mart-sales-trend-chart";
import { OilMartLowStockPanel } from "./oil-mart-low-stock-panel";
import { OilMartPendingApprovalsPanel } from "./oil-mart-pending-approvals-panel";

export function OilMartOverviewPage() {
  const { query, overview, openStockItem, openSale } = useOilMartOverview();

  return (
    <div>
      <PageHeader title="Oil mart overview" />

      <QueryBoundary loading={query.isLoading} error={query.error}>
        {overview && (
          <>
            <OilMartOverviewStats overview={overview} />
            <OilMartSalesTrendChart overview={overview} />

            <Grid>
              <Grid.Col span={{ base: 12, lg: 6 }}>
                <OilMartPendingApprovalsPanel
                  sales={overview.pendingApprovals}
                  onSelect={openSale}
                />
              </Grid.Col>
              <Grid.Col span={{ base: 12, lg: 6 }}>
                <OilMartLowStockPanel balances={overview.lowStock} onSelect={openStockItem} />
              </Grid.Col>
            </Grid>
          </>
        )}
      </QueryBoundary>
    </div>
  );
}
