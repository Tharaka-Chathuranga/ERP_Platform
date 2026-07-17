import { Paper, SimpleGrid, Text, Title } from "@mantine/core";

interface EfficiencyStatsProps {
  avgKmL: number;
  totalKm: number;
  totalL: number;
  fills: number;
}

export function EfficiencyStats({ avgKmL, totalKm, totalL, fills }: EfficiencyStatsProps) {
  return (
    <SimpleGrid cols={{ base: 2, sm: 4 }} mb="lg">
      <Paper withBorder radius="md" p="md">
        <Text fz="xs" c="dimmed" tt="uppercase" fw={500}>Avg km/L</Text>
        <Title order={3} fw={700} mt={4}>{avgKmL.toFixed(2)}</Title>
      </Paper>
      <Paper withBorder radius="md" p="md">
        <Text fz="xs" c="dimmed" tt="uppercase" fw={500}>Total km</Text>
        <Title order={3} fw={700} mt={4}>{totalKm.toFixed(0)}</Title>
      </Paper>
      <Paper withBorder radius="md" p="md">
        <Text fz="xs" c="dimmed" tt="uppercase" fw={500}>Fuel consumed</Text>
        <Title order={3} fw={700} mt={4}>{totalL.toFixed(1)} <Text span fz="sm" fw={400} c="dimmed">L</Text></Title>
      </Paper>
      <Paper withBorder radius="md" p="md">
        <Text fz="xs" c="dimmed" tt="uppercase" fw={500}>Fills recorded</Text>
        <Title order={3} fw={700} mt={4}>{fills}</Title>
      </Paper>
    </SimpleGrid>
  );
}
