import { Anchor, Card, Group, Title } from "@mantine/core";
import { Link } from "react-router-dom";
import dayjs from "dayjs";
import { DataTable, StackedCell, type Column } from "@ui/data";
import { EmptyState } from "@ui/feedback/EmptyState";
import type { OilMartSale } from "@core/types";
import { MoneyText } from "../../../../components/money-text";

function buildColumns(): Column<OilMartSale>[] {
  return [
    {
      header: "Sale",
      emphasis: true,
      render: (sale) => <StackedCell primary={sale.saleNo} secondary={sale.clientName} />,
    },
    {
      header: "Ordered",
      render: (sale) => (sale.orderedAt ? dayjs(sale.orderedAt).format("MMM D") : "—"),
    },
    { header: "Total", align: "right", render: (sale) => <MoneyText value={sale.total} emphasis /> },
  ];
}

interface OilMartPendingApprovalsPanelProps {
  sales: OilMartSale[];
  onSelect?: (sale: OilMartSale) => void;
}

export function OilMartPendingApprovalsPanel({
  sales,
  onSelect,
}: OilMartPendingApprovalsPanelProps) {
  return (
    <Card withBorder radius="md" padding="lg">
      <Group justify="space-between" mb="md">
        <Title order={4}>Awaiting approval</Title>
        <Anchor component={Link} to="/oil-mart/sales" size="sm">
          Sales board
        </Anchor>
      </Group>
      <DataTable
        columns={buildColumns()}
        data={sales}
        rowKey={(sale) => sale.id}
        onRowClick={onSelect}
        withCard={false}
        empty={<EmptyState title="Nothing pending" description="No orders are waiting for approval." />}
      />
    </Card>
  );
}
