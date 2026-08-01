import { Button, Card, Group, Title } from "@mantine/core";
import { IconPlus } from "@tabler/icons-react";
import { DataTable } from "@ui/data";
import { EmptyState } from "@ui/feedback/EmptyState";
import type { OilMartItemPrice } from "@core/types";
import { buildOilMartItemPriceColumns } from "./oil-mart-item-price-columns";

interface OilMartItemPriceHistoryProps {
  data: OilMartItemPrice[];
  loading?: boolean;
  error?: unknown;
  canManage: boolean;
  onAdd: () => void;
}

export function OilMartItemPriceHistory({
  data,
  loading,
  error,
  canManage,
  onAdd,
}: OilMartItemPriceHistoryProps) {
  return (
    <Card withBorder radius="md" padding="lg">
      <Group justify="space-between" mb="md">
        <Title order={4}>Price history</Title>
        {canManage && (
          <Button size="sm" leftSection={<IconPlus size={16} />} onClick={onAdd}>
            Add price
          </Button>
        )}
      </Group>

      <DataTable
        columns={buildOilMartItemPriceColumns()}
        data={data}
        rowKey={(price) => price.id}
        loading={loading}
        error={error}
        withCard={false}
        empty={
          <EmptyState
            title="No prices yet"
            description="Add a buy and sell price with the date it takes effect."
          />
        }
      />
    </Card>
  );
}
