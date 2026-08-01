import { Anchor, Breadcrumbs } from "@mantine/core";
import { Link, useNavigate } from "react-router-dom";
import { PageHeader } from "@ui/layout/PageHeader";
import { QueryBoundary } from "@ui/feedback/QueryBoundary";
import { useOilMartClientDetail } from "./hooks/use-oil-mart-client-detail";
import { OilMartClientSummaryCard } from "./oil-mart-client-summary-card";
import { OilMartClientSalesTable } from "./oil-mart-client-sales-table";

export function OilMartClientDetailPage() {
  const navigate = useNavigate();
  const { clientQuery, salesQuery, stats } = useOilMartClientDetail();

  return (
    <div>
      <Breadcrumbs mb="sm">
        <Anchor component={Link} to="/oil-mart/clients" size="sm">
          Clients
        </Anchor>
        <Anchor size="sm" c="dimmed">
          {clientQuery.data?.code ?? "…"}
        </Anchor>
      </Breadcrumbs>

      <PageHeader title={clientQuery.data?.name ?? "Client"} />

      <QueryBoundary loading={clientQuery.isLoading} error={clientQuery.error}>
        {clientQuery.data && (
          <>
            <OilMartClientSummaryCard client={clientQuery.data} stats={stats} />
            <OilMartClientSalesTable
              data={salesQuery.data ?? []}
              loading={salesQuery.isLoading}
              error={salesQuery.error}
              onRowClick={(sale) => navigate(`/oil-mart/sales/${sale.id}`)}
            />
          </>
        )}
      </QueryBoundary>
    </div>
  );
}
