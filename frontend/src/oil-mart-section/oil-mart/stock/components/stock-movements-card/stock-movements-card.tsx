import { Button, Card, Group, Title } from "@mantine/core";
import { IconPackageImport } from "@tabler/icons-react";
import { DataTable } from "@ui/data";
import { EmptyState } from "@ui/feedback/EmptyState";
import type { OilMartStockMovement } from "@core/types";
import { buildStockMovementColumns } from "./stock-movements-columns";

interface StockMovementsCardProps {
  data: OilMartStockMovement[];
  loading?: boolean;
  error?: unknown;
  canAdjust?: boolean;
  onRestock?: () => void;
}

export function StockMovementsCard({
  data,
  loading,
  error,
  canAdjust,
  onRestock,
}: StockMovementsCardProps) {
  return (
    <Card withBorder radius="md" padding="lg">
      <Group justify="space-between" mb="md">
        <Title order={4}>Stock movements</Title>
        {canAdjust && onRestock && (
          <Button size="sm" leftSection={<IconPackageImport size={16} />} onClick={onRestock}>
            Restock
          </Button>
        )}
      </Group>

      <DataTable
        columns={buildStockMovementColumns()}
        data={data}
        rowKey={(movement) => movement.id}
        loading={loading}
        error={error}
        withCard={false}
        empty={
          <EmptyState
            title="No movements"
            description="Receipts, sales and adjustments for this oil will appear here."
          />
        }
      />
    </Card>
  );
}
