import { Card, Title } from "@mantine/core";
import { DataTable } from "@ui/data";
import { EmptyState } from "@ui/feedback/EmptyState";
import type { OilMartSale } from "@core/types";
import { buildOilMartClientSalesColumns } from "./oil-mart-client-sales-columns";

interface OilMartClientSalesTableProps {
  data: OilMartSale[];
  loading?: boolean;
  error?: unknown;
  onRowClick?: (sale: OilMartSale) => void;
}

export function OilMartClientSalesTable({
  data,
  loading,
  error,
  onRowClick,
}: OilMartClientSalesTableProps) {
  return (
    <Card withBorder radius="md" padding="lg">
      <Title order={4} mb="md">
        Sales history
      </Title>
      <DataTable
        columns={buildOilMartClientSalesColumns()}
        data={data}
        rowKey={(sale) => sale.id}
        loading={loading}
        error={error}
        onRowClick={onRowClick}
        withCard={false}
        empty={
          <EmptyState
            title="No sales yet"
            description="Quotations raised for this client will appear here."
          />
        }
      />
    </Card>
  );
}
