import { Anchor, Card, Group, Title } from "@mantine/core";
import { Link } from "react-router-dom";
import dayjs from "dayjs";
import { DataTable, StackedCell, type Column } from "@ui/data";
import { EmptyState } from "@ui/feedback/EmptyState";
import type { OilMartQuotation } from "@core/types";
import { MoneyText } from "../../../../components/money-text";

function buildColumns(): Column<OilMartQuotation>[] {
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
        quotation.submittedAt ? dayjs(quotation.submittedAt).format("MMM D") : "—",
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
    <Card withBorder radius="md" padding="lg" h="100%">
      <Group justify="space-between" mb="md">
        <Title order={4}>Awaiting approval</Title>
        <Anchor component={Link} to="/oil-mart/quotations" size="sm">
          Quotations
        </Anchor>
      </Group>
      <DataTable
        columns={buildColumns()}
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
    </Card>
  );
}
