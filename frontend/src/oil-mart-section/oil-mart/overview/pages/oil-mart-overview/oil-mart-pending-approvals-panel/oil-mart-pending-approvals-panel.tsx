import { Anchor } from "@mantine/core";
import { Link } from "react-router-dom";
import { IconClipboardList } from "@tabler/icons-react";
import dayjs from "dayjs";
import { DataTable, StackedCell, type Column } from "@ui/data";
import { OverviewCard } from "@ui/layout/OverviewCard";
import { EmptyState } from "@ui/feedback/EmptyState";
import type { OilMartQuotation } from "@core/types";
import { MoneyText } from "../../../../components/money-text";

function buildColumns(expanded: boolean): Column<OilMartQuotation>[] {
  return [
    {
      header: "Quotation",
      emphasis: true,
      render: (quotation) => (
        <StackedCell primary={quotation.quotationNo} secondary={quotation.clientName} />
      ),
    },
    {
      header: "Submitted",
      render: (quotation) =>
        quotation.submittedAt
          ? dayjs(quotation.submittedAt).format(expanded ? "MMM D, YYYY" : "MMM D")
          : "—",
    },
    {
      header: "Grand total",
      align: "right",
      render: (quotation) => <MoneyText value={quotation.grandTotal} emphasis />,
    },
  ];
}

interface OilMartPendingApprovalsPanelProps {
  quotations: OilMartQuotation[];
  onSelect?: (quotation: OilMartQuotation) => void;
}

export function OilMartPendingApprovalsPanel({
  quotations,
  onSelect,
}: OilMartPendingApprovalsPanelProps) {
  return (
    <OverviewCard
      title="Awaiting approval"
      description="Quotations waiting for a manager"
      icon={<IconClipboardList size={22} />}
      accent="yellow"
      count={quotations.length}
      action={
        <Anchor component={Link} to="/oil-mart/quotations" size="sm">
          Quotations
        </Anchor>
      }
    >
      {(expanded) => (
        <DataTable
          columns={buildColumns(expanded)}
          data={quotations}
          rowKey={(quotation) => quotation.id}
          onRowClick={onSelect}
          withCard={false}
          empty={
            <EmptyState
              title="Nothing pending"
              description="No quotations are waiting for approval."
            />
          }
        />
      )}
    </OverviewCard>
  );
}
