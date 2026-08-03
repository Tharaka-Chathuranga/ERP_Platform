import { Badge, Button } from "@mantine/core";
import { IconPlus } from "@tabler/icons-react";
import { PageHeader } from "@ui/layout/PageHeader";
import { TableToolbar } from "@ui/data";
import { useCan } from "@auth/useCan";
import { OILMART_PROFIT_VIEW, OILMART_SALE_CREATE } from "@auth/permissions";
import {
  DOCUMENT_PERIOD_OPTIONS,
  periodLabel,
  type DocumentPeriod,
} from "../../components";
import { useOilMartQuotations } from "./hooks/use-oil-mart-quotations";
import { OilMartQuotationsTable } from "./oil-mart-quotations-table";

export function OilMartQuotationsPage() {
  const can = useCan();
  const canCreate = can(OILMART_SALE_CREATE);
  const showProfit = can(OILMART_PROFIT_VIEW);

  const {
    query,
    clientsQuery,
    active,
    rejected,
    closed,
    period,
    setPeriod,
    clientId,
    setClientId,
    search,
    setSearch,
    awaitingApproval,
    openNew,
    openDetail,
  } = useOilMartQuotations();

  const scope = periodLabel(period).toLowerCase();

  return (
    <div>
      <PageHeader title="Quotations" />

      <TableToolbar
        search={{ value: search, onChange: setSearch, placeholder: "Quotation no or client" }}
        leftSection={
          awaitingApproval > 0 ? (
            <Badge color="orange" variant="light" size="lg" radius="sm">
              {awaitingApproval} awaiting approval
            </Badge>
          ) : undefined
        }
        filters={[
          {
            label: "Period",
            value: period,
            onChange: (value: string) => setPeriod(value as DocumentPeriod),
            options: DOCUMENT_PERIOD_OPTIONS,
          },
          {
            label: "Client",
            value: clientId,
            onChange: setClientId,
            options: [
              { value: "ALL", label: "All clients" },
              ...(clientsQuery.data ?? []).map((client) => ({
                value: client.id,
                label: client.name,
              })),
            ],
          },
        ]}
        actions={
          canCreate ? (
            <Button leftSection={<IconPlus size={16} />} onClick={openNew}>
              Create quotation
            </Button>
          ) : undefined
        }
      />

      <OilMartQuotationsTable
        title="Approved, pending & draft"
        description="Everything still moving toward a sale."
        data={active}
        showProfit={showProfit}
        loading={query.isLoading}
        error={query.error}
        emptyTitle="Nothing in progress"
        emptyDescription={`No draft, pending or approved quotations ${scope}.`}
        onRowClick={openDetail}
        onNew={canCreate ? openNew : undefined}
      />

      <OilMartQuotationsTable
        title="Rejected"
        description="Sent back by the approver — edit and resubmit."
        data={rejected}
        showProfit={showProfit}
        loading={query.isLoading}
        emptyTitle="Nothing rejected"
        emptyDescription={`No quotations were rejected ${scope}.`}
        onRowClick={openDetail}
      />

      <OilMartQuotationsTable
        title="Closed"
        description="Cancelled and no longer actionable."
        data={closed}
        showProfit={showProfit}
        loading={query.isLoading}
        emptyTitle="Nothing closed"
        emptyDescription={`No quotations were cancelled ${scope}.`}
        onRowClick={openDetail}
      />

    </div>
  );
}
