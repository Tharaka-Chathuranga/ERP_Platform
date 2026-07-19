import { Badge, Button, Card, Group, Progress, SimpleGrid, Text } from "@mantine/core";
import { IconPencil, IconRuler2 } from "@tabler/icons-react";
import type { FuelTank } from "@core/types";

const PURPOSE_LABEL: Record<string, string> = {
  INTERNAL: "Internal work",
  VEHICLE: "Vehicles",
};

function fillPercent(tank: FuelTank): number {
  if (!tank.capacityLitres) return 0;
  return Math.min(100, Math.round((tank.currentLitres / tank.capacityLitres) * 100));
}

interface FuelTankCardsProps {
  tanks: FuelTank[];
  canManage: boolean;
  onEdit: (tank: FuelTank) => void;
  onRecordReading: (tank: FuelTank) => void;
}

export function FuelTankCards({ tanks, canManage, onEdit, onRecordReading }: FuelTankCardsProps) {
  return (
    <SimpleGrid cols={{ base: 1, md: 2 }} mb="xl">
      {tanks.map((tank) => (
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
                onClick={() => onEdit(tank)}
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
              color="grape"
              leftSection={<IconRuler2 size={14} />}
              onClick={() => onRecordReading(tank)}
            >
              Record reading
            </Button>
          </Group>
        </Card>
      ))}
    </SimpleGrid>
  );
}
