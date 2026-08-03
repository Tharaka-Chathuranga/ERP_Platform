import { Badge, Button, Group } from "@mantine/core";
import { IconPlus } from "@tabler/icons-react";
import { PageHeader } from "@ui/layout/PageHeader";
import { TableToolbar } from "@ui/data";
import { useCan } from "@auth/useCan";
import { OILMART_PROFIT_VIEW, OILMART_SALE_CREATE } from "@auth/permissions";
import type { OilMartInvoiceStatus } from "@core/types";
import { OIL_MART_INVOICE_STATUS_LABELS } from "../../../components/oil-mart-invoice-status-badge";
import { useOilMartInvoices } from "./hooks/use-oil-mart-invoices";
import { OilMartInvoicesTable } from "./oil-mart-invoices-table";

const STATUS_OPTIONS = [
  { value: "ALL", label: "All statuses" },
  ...(Object.keys(OIL_MART_INVOICE_STATUS_LABELS) as OilMartInvoiceStatus[]).map((value) => ({
    value,
    label: OIL_MART_INVOICE_STATUS_LABELS[value],
  })),
];

export function OilMartInvoicesPage() {
  const can = useCan();
  const canCreate = can(OILMART_SALE_CREATE);
  const showProfit = can(OILMART_PROFIT_VIEW);

  const {
    query,
    invoices,
    clientsQuery,
    status,
    setStatus,
    clientId,
    setClientId,
    dateRange,
    setDateRange,
    awaitingApproval,
    openNew,
    openDetail,
  } = useOilMartInvoices();

  return (
    <div>
      <PageHeader title="Invoices" />

      <TableToolbar
        leftSection={
          awaitingApproval > 0 ? (
            <Badge color="orange" variant="light" size="lg" radius="sm">
              {awaitingApproval} awaiting approval
            </Badge>
          ) : undefined
        }
        filters={[
          {
            label: "Status",
            value: status,
            onChange: (value: string) => setStatus(value as OilMartInvoiceStatus | "ALL"),
            options: STATUS_OPTIONS,
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
          { type: "daterange", label: "Invoiced", value: dateRange, onChange: setDateRange },
        ]}
        actions={
          canCreate ? (
            <Group gap="sm">
              <Button leftSection={<IconPlus size={16} />} onClick={openNew}>
                New invoice
              </Button>
            </Group>
          ) : undefined
        }
      />

      <OilMartInvoicesTable
        data={invoices}
        showProfit={showProfit}
        loading={query.isLoading}
        error={query.error}
        onRowClick={openDetail}
        onNew={canCreate ? openNew : undefined}
      />
    </div>
  );
}
