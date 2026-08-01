import { Drawer, Group, Stack, Text } from "@mantine/core";
import { DataTable } from "@ui/data";
import { EmptyState } from "@ui/feedback/EmptyState";
import type { OilMartStockBalance, OilMartStockMovement } from "@core/types";
import { MoneyText } from "../../../../components/money-text";
import { buildOilMartMovementColumns } from "./oil-mart-movement-columns";

interface OilMartMovementDrawerProps {
  balance: OilMartStockBalance | null;
  movements: OilMartStockMovement[];
  loading?: boolean;
  error?: unknown;
  onClose: () => void;
}

export function OilMartMovementDrawer({
  balance,
  movements,
  loading,
  error,
  onClose,
}: OilMartMovementDrawerProps) {
  return (
    <Drawer
      opened={Boolean(balance)}
      onClose={onClose}
      position="right"
      size="xl"
      title={
        <Stack gap={2}>
          <Text fw={700}>{balance?.itemName ?? "Movements"}</Text>
          <Text size="xs" c="dimmed">
            {balance?.itemCode}
          </Text>
        </Stack>
      }
    >
      {balance && (
        <Group gap="xl" mb="lg">
          <Stack gap={2}>
            <Text size="xs" c="dimmed" tt="uppercase" fw={600}>
              On hand
            </Text>
            <Text fw={700} fz={22}>
              {balance.quantityOnHand.toLocaleString()} L
            </Text>
          </Stack>
          <Stack gap={2}>
            <Text size="xs" c="dimmed" tt="uppercase" fw={600}>
              Stock value
            </Text>
            <MoneyText value={balance.stockValue} fz={22} fw={700} />
          </Stack>
        </Group>
      )}

      <DataTable
        columns={buildOilMartMovementColumns()}
        data={movements}
        rowKey={(movement) => movement.id}
        loading={loading}
        error={error}
        withCard={false}
        empty={
          <EmptyState
            title="No movements"
            description="Receipts and dispatches for this oil will appear here."
          />
        }
      />
    </Drawer>
  );
}
