import { Group, Stack, Text, Title } from "@mantine/core";
import { IconGauge } from "@tabler/icons-react";
import type { FuelTank } from "@core/types";
import { ReadingsTable } from "./readings-table";
import { RefillsTable } from "./refills-table";

interface FuelTankHistoryProps {
  tanks: FuelTank[];
}

export function FuelTankHistory({ tanks }: FuelTankHistoryProps) {
  return (
    <Stack gap="xl">
      {tanks.map((tank) => (
        <div key={tank.id}>
          <Title order={4} mb="sm">
            <Group gap="xs">
              <IconGauge size={18} />
              {tank.name}
            </Group>
          </Title>
          <Text fw={600} fz="xs" tt="uppercase" c="dimmed" mb="xs">Readings</Text>
          <ReadingsTable tankId={tank.id} />
          <Text fw={600} fz="xs" tt="uppercase" c="dimmed" mb="xs" mt="md">
            Refills
          </Text>
          <RefillsTable tankId={tank.id} />
        </div>
      ))}
    </Stack>
  );
}
