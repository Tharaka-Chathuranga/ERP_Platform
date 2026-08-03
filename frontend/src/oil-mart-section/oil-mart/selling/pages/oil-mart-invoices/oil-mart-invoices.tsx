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
import { useOilMartInvoices } from "./hooks/use-oil-mart-invoices";
import { OilMartInvoicesTable } from "./oil-mart-invoices-table";

export function OilMartInvoicesPage() {
  const can = useCan();
  const canCreate = can(OILMART_SALE_CREATE);
  const showProfit = can(OILMART_PROFIT_VIEW);

  const {
    query,
    clientsQuery,
    active,
    rejected,
    period,
    setPeriod,
    clientId,
    setClientId,
    search,
    setSearch,
    awaitingApproval,
    openNew,
    openDetail,
  } = useOilMartInvoices();

  const scope = periodLabel(period).toLowerCase();

  return (
    <div>
      <PageHeader title="Invoices" />

      <TableToolbar
        search={{ value: search, onChange: setSearch, placeholder: "Invoice, quotation or client" }}
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
              Create invoice
            </Button>
          ) : undefined
        }
      />

      <OilMartInvoicesTable
        title="Approved & pending approval"
        description="Invoices still moving through approval, and those already issued."
        data={active}
        showProfit={showProfit}
        loading={query.isLoading}
        error={query.error}
        emptyTitle="Nothing in progress"
        emptyDescription={`No pending or approved invoices ${scope}.`}
        onRowClick={openDetail}
        onNew={canCreate ? openNew : undefined}
      />

      <OilMartInvoicesTable
        title="Rejected"
        description="Sent back by the approver — point them at the correct quotation."
        data={rejected}
        showProfit={showProfit}
        loading={query.isLoading}
        emptyTitle="Nothing rejected"
        emptyDescription={`No invoices were rejected ${scope}.`}
        onRowClick={openDetail}
      />
    </div>
  );
}
