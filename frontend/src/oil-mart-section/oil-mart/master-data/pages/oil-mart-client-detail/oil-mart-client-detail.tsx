import { Anchor, Breadcrumbs } from "@mantine/core";
import { Link, useNavigate } from "react-router-dom";
import { PageHeader } from "@ui/layout/PageHeader";
import { QueryBoundary } from "@ui/feedback/QueryBoundary";
import { useOilMartClientDetail } from "./hooks/use-oil-mart-client-detail";
import { OilMartClientSummaryCard } from "./oil-mart-client-summary-card";
import { OilMartClientQuotationsTable } from "./oil-mart-client-quotations-table";

export function OilMartClientDetailPage() {
  const navigate = useNavigate();
  const { clientQuery, quotationsQuery, stats } = useOilMartClientDetail();

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
            <OilMartClientQuotationsTable
              data={quotationsQuery.data ?? []}
              loading={quotationsQuery.isLoading}
              error={quotationsQuery.error}
              onRowClick={(quotation) => navigate(`/oil-mart/quotations/${quotation.id}`)}
            />
          </>
        )}
      </QueryBoundary>
    </div>
  );
}
