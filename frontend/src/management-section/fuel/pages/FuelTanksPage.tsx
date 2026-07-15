import { useState } from "react";
import {
  Badge,
  Button,
  Card,
  Group,
  Progress,
  SimpleGrid,
  Stack,
  Text,
  Title,
} from "@mantine/core";
import { IconDroplet, IconGauge, IconPencil, IconRuler2 } from "@tabler/icons-react";
import { useQuery } from "@tanstack/react-query";
import dayjs from "dayjs";
import { PageHeader } from "@ui/layout/PageHeader";
import { DataTable, type Column } from "@ui/data";
import { useCan } from "@auth/useCan";
import { FUEL_MANAGE } from "@auth/permissions";
import { qk } from "@core/queryKeys";
import type { FuelTank, FuelTankReading, FuelTankRefill } from "@core/types";
import { listReadings, listRefills, listTanks } from "../api";
import { EditTankModal } from "../components/EditTankModal";
import { RecordReadingModal } from "../components/RecordReadingModal";
import { RecordRefillModal } from "../components/RecordRefillModal";

const PURPOSE_LABEL: Record<string, string> = {
  INTERNAL: "Internal work",
  VEHICLE: "Vehicles",
};

function fillPercent(tank: FuelTank): number {
  if (!tank.capacityLitres) return 0;
  return Math.min(100, Math.round((tank.currentLitres / tank.capacityLitres) * 100));
}

function ReadingsTable({ tankId }: { tankId: string }) {
  const readings = useQuery({
    queryKey: qk.tankReadings(tankId),
    queryFn: () => listReadings(tankId),
  });
  const columns: Column<FuelTankReading>[] = [
    { header: "Time", render: (r) => dayjs(r.readingAt).format("MMM D, YYYY HH:mm") },
    { header: "Measured (L)", align: "right", render: (r) => r.litresMeasured },
    {
      header: "Consumed since prev. (L)",
      align: "right",
      render: (r) => (r.consumptionSincePrevious != null ? r.consumptionSincePrevious : "—"),
    },
    { header: "Note", render: (r) => r.note ?? "—" },
  ];
  return (
    <DataTable
      columns={columns}
      data={readings.data}
      rowKey={(r) => r.id}
      loading={readings.isLoading}
      error={readings.error}
      empty={<Text c="dimmed" p="md">No readings recorded yet.</Text>}
    />
  );
}

function RefillsTable({ tankId }: { tankId: string }) {
  const refills = useQuery({
    queryKey: qk.tankRefills(tankId),
    queryFn: () => listRefills(tankId),
  });
  const columns: Column<FuelTankRefill>[] = [
    { header: "Time", render: (r) => dayjs(r.refilledAt).format("MMM D, YYYY HH:mm") },
    { header: "Litres", align: "right", render: (r) => r.litres },
    { header: "Note", render: (r) => r.note ?? "—" },
  ];
  return (
    <DataTable
      columns={columns}
      data={refills.data}
      rowKey={(r) => r.id}
      loading={refills.isLoading}
      error={refills.error}
      empty={<Text c="dimmed" p="md">No refills recorded yet.</Text>}
    />
  );
}

export function FuelTanksPage() {
  const can = useCan();
  const canManage = can(FUEL_MANAGE);
  const tanks = useQuery({ queryKey: qk.fuelTanks(), queryFn: listTanks });

  const [refillTank, setRefillTank] = useState<FuelTank | undefined>();
  const [readingTank, setReadingTank] = useState<FuelTank | undefined>();
  const [editTank, setEditTank] = useState<FuelTank | undefined>();

  const list = tanks.data ?? [];

  return (
    <div>
      <PageHeader title="Fuel tanks" />

      <SimpleGrid cols={{ base: 1, md: 2 }} mb="xl">
        {list.map((tank) => (
          <Card key={tank.id} withBorder radius="md" padding="lg">
            <Group justify="space-between" align="flex-start">
              <div>
                <Group gap="xs">
                  <Text fw={700} fz="lg">{tank.name}</Text>
                  <Badge color={tank.purpose === "INTERNAL" ? "grape" : "teal"} variant="light" radius="sm">
                    {PURPOSE_LABEL[tank.purpose] ?? tank.purpose}
                  </Badge>
                </Group>
                <Text c="dimmed" fz="sm" mt={4}>
                  {tank.currentLitres} / {tank.capacityLitres} L
                </Text>
              </div>
              {canManage && (
                <Button
                  size="xs"
                  variant="subtle"
                  color="gray"
                  leftSection={<IconPencil size={14} />}
                  onClick={() => setEditTank(tank)}
                >
                  Edit
                </Button>
              )}
            </Group>

            <Progress value={fillPercent(tank)} mt="md" size="lg" radius="sm" />
            <Text c="dimmed" fz="xs" mt={4}>{fillPercent(tank)}% full</Text>

            <Group mt="md" gap="sm">
              <Button
                size="xs"
                variant="light"
                leftSection={<IconDroplet size={14} />}
                onClick={() => setRefillTank(tank)}
              >
                Record refill
              </Button>
              {tank.purpose === "INTERNAL" && (
                <Button
                  size="xs"
                  variant="light"
                  color="grape"
                  leftSection={<IconRuler2 size={14} />}
                  onClick={() => setReadingTank(tank)}
                >
                  Record reading
                </Button>
              )}
            </Group>
          </Card>
        ))}
      </SimpleGrid>

      <Stack gap="xl">
        {list.map((tank) => (
          <div key={tank.id}>
            <Title order={4} mb="sm">
              <Group gap="xs">
                <IconGauge size={18} />
                {tank.name}
              </Group>
            </Title>
            {tank.purpose === "INTERNAL" && (
              <>
                <Text fw={600} fz="xs" tt="uppercase" c="dimmed" mb="xs">Readings</Text>
                <ReadingsTable tankId={tank.id} />
              </>
            )}
            <Text fw={600} fz="xs" tt="uppercase" c="dimmed" mb="xs" mt={tank.purpose === "INTERNAL" ? "md" : 0}>
              Refills
            </Text>
            <RefillsTable tankId={tank.id} />
          </div>
        ))}
      </Stack>

      <RecordRefillModal opened={!!refillTank} onClose={() => setRefillTank(undefined)} tank={refillTank} />
      <RecordReadingModal opened={!!readingTank} onClose={() => setReadingTank(undefined)} tank={readingTank} />
      <EditTankModal opened={!!editTank} onClose={() => setEditTank(undefined)} tank={editTank} />
    </div>
  );
}
