import { Button } from "@mantine/core";
import { IconPlus } from "@tabler/icons-react";
import dayjs from "dayjs";
import { DataTable, StackedCell, type Column } from "@ui/data";
import { EmptyState } from "@ui/feedback/EmptyState";
import type { OilMartInvoice } from "@core/types";
import { OilMartInvoiceStatusBadge } from "../../../../components/oil-mart-invoice-status-badge";
import { MoneyText } from "../../../../components/money-text";

function buildColumns(showProfit: boolean): Column<OilMartInvoice>[] {
  const columns: Column<OilMartInvoice>[] = [
    {
      header: "Invoice",
      emphasis: true,
      render: (invoice) => (
        <StackedCell primary={invoice.invoiceNo} secondary={invoice.clientName} />
      ),
    },
    {
      header: "Quotation",
      render: (invoice) => (
        <StackedCell
          primary={invoice.quotationNo}
          secondary={`${invoice.lines.length} line${invoice.lines.length === 1 ? "" : "s"}`}
        />
      ),
    },
    { header: "Status", render: (invoice) => <OilMartInvoiceStatusBadge status={invoice.status} /> },
    { header: "Date", render: (invoice) => dayjs(invoice.invoiceDate).format("MMM D, YYYY") },
    {
      header: "Grand total",
      align: "right",
      render: (invoice) => <MoneyText value={invoice.grandTotal} emphasis />,
    },
  ];

  if (showProfit) {
    columns.push({
      header: "Profit",
      align: "right",
      render: (invoice) => (
        <MoneyText
          value={invoice.totalProfit}
          c={(invoice.totalProfit ?? 0) < 0 ? "red" : "teal"}
        />
      ),
    });
  }

  return columns;
}

interface OilMartInvoicesTableProps {
  data: OilMartInvoice[];
  showProfit?: boolean;
  loading?: boolean;
  error?: unknown;
  onRowClick?: (invoice: OilMartInvoice) => void;
  onNew?: () => void;
}

export function OilMartInvoicesTable({
  data,
  showProfit,
  loading,
  error,
  onRowClick,
  onNew,
}: OilMartInvoicesTableProps) {
  return (
    <DataTable
      columns={buildColumns(Boolean(showProfit))}
      data={data}
      rowKey={(invoice) => invoice.id}
      loading={loading}
      error={error}
      onRowClick={onRowClick}
      empty={
        <EmptyState
          title="No invoices"
          description="An invoice is raised from an approved quotation."
          action={
            onNew ? (
              <Button leftSection={<IconPlus size={16} />} onClick={onNew}>
                New invoice
              </Button>
            ) : undefined
          }
        />
      }
    />
  );
}
