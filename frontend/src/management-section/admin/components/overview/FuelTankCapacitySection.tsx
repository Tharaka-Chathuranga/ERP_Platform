import { Grid, Group, Paper, Progress, Stack, Text, ThemeIcon } from "@mantine/core";
import { IconGasStation, IconTruckLoading } from "@tabler/icons-react";
import { useQuery } from "@tanstack/react-query";
import { qk } from "@core/queryKeys";
import { getFuelOverview } from "@fuel";
import type { FuelOverviewTank } from "@core/types";

const CONFIG: Record<string, { label: string; icon: React.ReactNode; color: string }> = {
  INTERNAL: { label: "Internal tank", icon: <IconGasStation size={22} />, color: "grape" },
  VEHICLE:  { label: "Vehicle tank",  icon: <IconTruckLoading size={22} />, color: "teal" },
};

function TankBox({ tank }: { tank: FuelOverviewTank }) {
  const cfg = CONFIG[tank.purpose] ?? { label: tank.name, icon: <IconGasStation size={22} />, color: "blue" };
  const pct = tank.capacityLitres
    ? Math.min(100, Math.round((tank.currentLitres / tank.capacityLitres) * 100))
    : 0;
  const low = pct < 25;

  return (
    <Paper p="lg" radius="md" withBorder h="100%">
      <Stack gap="md">
        <Group gap="sm" wrap="nowrap">
          <ThemeIcon variant="light" color={low ? "red" : cfg.color} radius="md" size={38}>
            {cfg.icon}
          </ThemeIcon>
          <div>
            <Text fw={600}>{cfg.label}</Text>
            <Text c="dimmed" fz="xs">Current level vs. capacity</Text>
          </div>
        </Group>
        <Stack gap={6}>
          <Group justify="space-between">
            <Text fz="sm" fw={500}>{tank.currentLitres.toLocaleString()} L</Text>
            <Text fz="sm" c="dimmed">of {tank.capacityLitres.toLocaleString()} L</Text>
          </Group>
          <Progress
            value={pct}
            color={low ? "red" : cfg.color}
            size="xl"
            radius="sm"
            striped={low}
            animated={low}
          />
          <Text fz="xs" c={low ? "red" : "dimmed"}>
            {pct}% full{low ? " — low level" : ""}
          </Text>
        </Stack>
      </Stack>
    </Paper>
  );
}

export function FuelTankCapacitySection() {
  const overview = useQuery({ queryKey: qk.fuelOverview(), queryFn: getFuelOverview });
  const tanks = overview.data?.tanks ?? [];

  return (
    <Grid>
      {tanks.map((tank) => (
        <Grid.Col key={tank.purpose} span={{ base: 12, sm: 6 }}>
          <TankBox tank={tank} />
        </Grid.Col>
      ))}
    </Grid>
  );
}
