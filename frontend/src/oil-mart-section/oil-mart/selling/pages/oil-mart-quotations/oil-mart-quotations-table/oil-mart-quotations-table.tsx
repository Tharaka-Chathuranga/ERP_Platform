import { Badge, Button, Card, Group, Text, Title } from "@mantine/core";
import { IconPlus } from "@tabler/icons-react";
import dayjs from "dayjs";
import { DataTable, StackedCell, type Column } from "@ui/data";
import { EmptyState } from "@ui/feedback/EmptyState";
import type { OilMartQuotation } from "@core/types";
import { OilMartStatusBadge } from "../../../../components/oil-mart-status-badge";
import { MoneyText } from "../../../../components/money-text";

function buildColumns(showProfit: boolean): Column<OilMartQuotation>[] {
  const columns: Column<OilMartQuotation>[] = [
    {
      header: "Quotation",
      emphasis: true,
      render: (quotation) => (
        <StackedCell primary={quotation.quotationNo} secondary={quotation.clientName} />
      ),
    },
    {
      header: "Status",
      render: (quotation) => (
        <Group gap={6} wrap="nowrap">
          <OilMartStatusBadge status={quotation.status} />
          {quotation.expired && quotation.status !== "CANCELLED" && (
            <Badge color="orange" variant="light" radius="sm" size="sm">
              Expired
            </Badge>
          )}
        </Group>
      ),
    },
    {
      header: "Issued",
      render: (quotation) => dayjs(quotation.issuedDate).format("MMM D, YYYY"),
    },
    {
      header: "Valid until",
      render: (quotation) => dayjs(quotation.validUntil).format("MMM D, YYYY"),
    },
    {
      header: "Lines",
      align: "right",
      render: (quotation) => quotation.lines.length,
    },
    {
      header: "Grand total",
      align: "right",
      render: (quotation) => <MoneyText value={quotation.grandTotal} emphasis />,
    },
  ];

  if (showProfit) {
    columns.push({
      header: "Profit",
      align: "right",
      render: (quotation) => (
        <MoneyText
          value={quotation.totalProfit}
          c={(quotation.totalProfit ?? 0) < 0 ? "red" : "teal"}
        />
      ),
    });
  }

  return columns;
}

interface OilMartQuotationsTableProps {
  title: string;
  description?: string;
  data: OilMartQuotation[];
  showProfit?: boolean;
  loading?: boolean;
  error?: unknown;
  emptyTitle: string;
  emptyDescription: string;
  onRowClick?: (quotation: OilMartQuotation) => void;
  onNew?: () => void;
}

export function OilMartQuotationsTable({
  title,
  description,
  data,
  showProfit,
  loading,
  error,
  emptyTitle,
  emptyDescription,
  onRowClick,
  onNew,
}: OilMartQuotationsTableProps) {
  return (
    <Card withBorder radius="md" padding="lg" mb="lg">
      <Group justify="space-between" mb="md" align="flex-start">
        <div>
          <Group gap="xs">
            <Title order={4}>{title}</Title>
            <Badge variant="light" radius="sm">
              {data.length}
            </Badge>
          </Group>
          {description && (
            <Text size="xs" c="dimmed" mt={2}>
              {description}
            </Text>
          )}
        </div>
      </Group>

      <DataTable
        columns={buildColumns(Boolean(showProfit))}
        data={data}
        rowKey={(quotation) => quotation.id}
        loading={loading}
        error={error}
        onRowClick={onRowClick}
        withCard={false}
        empty={
          <EmptyState
            title={emptyTitle}
            description={emptyDescription}
            action={
              onNew ? (
                <Button leftSection={<IconPlus size={16} />} onClick={onNew}>
                  Create quotation
                </Button>
              ) : undefined
            }
          />
        }
      />
    </Card>
  );
}
