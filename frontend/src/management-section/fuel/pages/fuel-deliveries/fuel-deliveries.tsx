import { useMemo, useState } from "react";
import { Button, Card, Divider, Group, Modal, Stack, Text } from "@mantine/core";
import { IconPlus } from "@tabler/icons-react";
import { useQuery } from "@tanstack/react-query";
import dayjs from "dayjs";
import { PageHeader } from "@ui/layout/PageHeader";
import { EmptyState } from "@ui/feedback/EmptyState";
import { DataTable, TableToolbar, type Column } from "@ui/data";
import { useUsers } from "@core/hooks/useUsers";
import { useCan } from "@auth/useCan";
import { FUEL_VIEW } from "@auth/permissions";
import { qk } from "@core/queryKeys";
import type { FuelDelivery } from "@core/types";
import { listFuelDeliveries, listTanks } from "../../api";
import { RecordFuelDeliveryModal } from "../../components/record-fuel-delivery-modal";

/** Signed litres variance, coloured; green when balanced within tolerance. */
function Variance({ value, tolerance = 0 }: { value: number; tolerance?: number }) {
  const ok = Math.abs(value) <= tolerance;
  const sign = value > 0 ? "+" : "";
  return (
    <Text component="span" fw={600} c={ok ? "teal" : "orange"}>
      {ok ? "✓ 0" : `${sign}${value.toLocaleString()}`}
    </Text>
  );
}

export function FuelDeliveriesPage() {
  const can = useCan();
  const canCreate = can(FUEL_VIEW);

  const [search, setSearch] = useState("");
  const [dateRange, setDateRange] = useState<[Date | null, Date | null]>([null, null]);
  const [recording, setRecording] = useState(false);
  const [detail, setDetail] = useState<FuelDelivery | undefined>();

  const deliveries = useQuery({
    queryKey: qk.fuelDeliveries(),
    queryFn: () => listFuelDeliveries(),
  });
  const tanks = useQuery({ queryKey: qk.fuelTanks(), queryFn: listTanks });
  const users = useUsers();

  const tankName = useMemo(() => {
    const map = new Map((tanks.data ?? []).map((t) => [t.id, t.name]));
    return (id: string) => map.get(id) ?? "—";
  }, [tanks.data]);

  const userName = useMemo(() => {
    const map = new Map(users.data?.map((u) => [u.id, u.displayName || u.username]));
    return (id: string) => map.get(id) ?? "—";
  }, [users.data]);

  const filtered = useMemo(() => {
    const all = deliveries.data?.content ?? [];
    const [from, to] = dateRange;
    const q = search.trim().toLowerCase();
    return all.filter((d) => {
      const on = dayjs(d.deliveredOn);
      if (from && on.isBefore(dayjs(from).startOf("day"))) return false;
      if (to && on.isAfter(dayjs(to).endOf("day"))) return false;
      if (q) {
        const ref = d.deliveryReference.toLowerCase();
        const supplier = (d.supplierName ?? "").toLowerCase();
        if (!ref.includes(q) && !supplier.includes(q)) return false;
      }
      return true;
    });
  }, [deliveries.data, dateRange, search]);

  const columns: Column<FuelDelivery>[] = [
    { header: "Date", render: (d) => dayjs(d.deliveredOn).format("MMM D, YYYY") },
    { header: "Reference", emphasis: true, render: (d) => d.deliveryReference },
    { header: "Supplier", render: (d) => d.supplierName ?? "—" },
    { header: "Ordered (L)", align: "right", render: (d) => d.orderedLitres.toLocaleString() },
    { header: "Delivered (L)", align: "right", render: (d) => d.deliveredLitres.toLocaleString() },
    { header: "Variance (L)", align: "right", render: (d) => <Variance value={d.orderedVsDeliveredVariance} /> },
    { header: "Tanks", render: (d) => d.lines.map((l) => tankName(l.tankId)).join(", ") },
    { header: "Recorded by", render: (d) => userName(d.recordedByUserId) },
  ];

  return (
    <div>
      <PageHeader title="Fuel deliveries" />

      <TableToolbar
        search={{ value: search, onChange: setSearch, placeholder: "Search reference or supplier…" }}
        filters={[{ type: "daterange", label: "Date", value: dateRange, onChange: setDateRange }]}
        actions={
          canCreate ? (
            <Button leftSection={<IconPlus size={16} />} onClick={() => setRecording(true)}>
              New delivery
            </Button>
          ) : undefined
        }
      />

      <DataTable
        columns={columns}
        data={filtered}
        rowKey={(d) => d.id}
        onRowClick={(d) => setDetail(d)}
        loading={deliveries.isLoading}
        error={deliveries.error}
        empty={<EmptyState title="No fuel deliveries" description="No deliveries match the current filter." />}
      />

      <RecordFuelDeliveryModal opened={recording} onClose={() => setRecording(false)} />
      <DeliveryDetailModal delivery={detail} tankName={tankName} userName={userName} onClose={() => setDetail(undefined)} />
    </div>
  );
}

/** Read-only detail: mirrors the paper "Fuel Delivery Update Report". */
function DeliveryDetailModal({
  delivery,
  tankName,
  userName,
  onClose,
}: {
  delivery?: FuelDelivery;
  tankName: (id: string) => string;
  userName: (id: string) => string;
  onClose: () => void;
}) {
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
