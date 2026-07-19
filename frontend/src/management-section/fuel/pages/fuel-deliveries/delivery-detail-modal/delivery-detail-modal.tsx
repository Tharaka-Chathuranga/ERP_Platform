import { Card, Divider, Group, Modal, Stack, Text } from "@mantine/core";
import dayjs from "dayjs";
import type { FuelDelivery } from "@core/types";
import { Variance } from "../variance";

interface DeliveryDetailModalProps {
  delivery?: FuelDelivery;
  tankName: (id: string) => string;
  userName: (id: string) => string;
  onClose: () => void;
}

export function DeliveryDetailModal({ delivery, tankName, userName, onClose }: DeliveryDetailModalProps) {
  const dischargeWindow =
    delivery?.dischargeStartedAt && delivery?.dischargeFinishedAt
      ? `${dayjs(delivery.dischargeStartedAt).format("HH:mm")} → ${dayjs(delivery.dischargeFinishedAt).format("HH:mm")}`
      : "—";

  return (
    <Modal
      opened={!!delivery}
      onClose={onClose}
      title={delivery ? `Delivery ${delivery.deliveryReference}` : ""}
      centered
      size="lg"
      styles={{ title: { fontSize: "var(--mantine-font-size-xl)", fontWeight: 700 } }}
    >
      {delivery && (
        <Stack>
          <Group justify="space-between">
            <Text c="dimmed" fz="sm">Date</Text>
            <Text fw={600}>{dayjs(delivery.deliveredOn).format("dddd, D MMMM YYYY")}</Text>
          </Group>
          <Group justify="space-between">
            <Text c="dimmed" fz="sm">Supplier</Text>
            <Text fw={600}>{delivery.supplierName ?? "—"}</Text>
          </Group>
          <Group justify="space-between">
            <Text c="dimmed" fz="sm">Discharge window</Text>
            <Text fw={600}>{dischargeWindow}</Text>
          </Group>
          <Divider />
          <Group justify="space-between">
            <Text c="dimmed" fz="sm">Ordered</Text>
            <Text fw={600}>{delivery.orderedLitres.toLocaleString()} L</Text>
          </Group>
          <Group justify="space-between">
            <Text c="dimmed" fz="sm">Delivered</Text>
            <Text fw={600}>{delivery.deliveredLitres.toLocaleString()} L</Text>
          </Group>
          <Group justify="space-between">
            <Text c="dimmed" fz="sm">Ordered vs delivered</Text>
            <Variance value={delivery.orderedVsDeliveredVariance} />
          </Group>

          <Divider label="Tank distribution & dip readings" labelPosition="left" />
          {delivery.lines.map((line) => (
            <Card key={line.id} withBorder radius="md" padding="md">
              <Group justify="space-between" mb="xs">
                <Text fw={600}>{tankName(line.tankId)}</Text>
                <Text fw={700}>{line.litresDelivered.toLocaleString()} L</Text>
              </Group>
              <Group justify="space-between">
                <Text c="dimmed" fz="sm">
                  Dip before → after
                </Text>
                <Text fw={500}>
                  {line.dipBeforeLitres != null ? line.dipBeforeLitres.toLocaleString() : "—"} →{" "}
                  {line.dipAfterLitres != null ? line.dipAfterLitres.toLocaleString() : "—"} L
                </Text>
              </Group>
              {line.dipReconciliationVariance != null && (
                <Group justify="space-between" mt={4}>
                  <Text c="dimmed" fz="sm">Dip reconciliation</Text>
                  <Variance value={line.dipReconciliationVariance} tolerance={0.5} />
                </Group>
              )}
            </Card>
          ))}

          {delivery.note && (
            <>
              <Divider />
              <Text c="dimmed" fz="sm">Note</Text>
              <Text>{delivery.note}</Text>
            </>
          )}
          <Text c="dimmed" fz="xs" ta="right">
            Recorded by {userName(delivery.recordedByUserId)}
          </Text>
        </Stack>
      )}
    </Modal>
  );
}
