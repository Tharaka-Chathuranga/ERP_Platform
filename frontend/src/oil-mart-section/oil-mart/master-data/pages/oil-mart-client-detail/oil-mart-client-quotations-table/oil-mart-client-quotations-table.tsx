import { Card, Title } from "@mantine/core";
import { DataTable } from "@ui/data";
import { EmptyState } from "@ui/feedback/EmptyState";
import type { OilMartQuotation } from "@core/types";
import { buildOilMartClientQuotationsColumns } from "./oil-mart-client-quotations-columns";

interface OilMartClientQuotationsTableProps {
  data: OilMartQuotation[];
  loading?: boolean;
  error?: unknown;
  onRowClick?: (quotation: OilMartQuotation) => void;
}

export function OilMartClientQuotationsTable({
  data,
  loading,
  error,
  onRowClick,
}: OilMartClientQuotationsTableProps) {
  return (
    <Card withBorder radius="md" padding="lg">
      <Title order={4} mb="md">
        Quotation history
      </Title>
      <DataTable
        columns={buildOilMartClientQuotationsColumns()}
        data={data}
        rowKey={(quotation) => quotation.id}
        loading={loading}
        error={error}
        onRowClick={onRowClick}
        withCard={false}
        empty={
          <EmptyState
            title="No quotations yet"
            description="Quotations raised for this client will appear here."
          />
        }
      />
    </Card>
  );
}
