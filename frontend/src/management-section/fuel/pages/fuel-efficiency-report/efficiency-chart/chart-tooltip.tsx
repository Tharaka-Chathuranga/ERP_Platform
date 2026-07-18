import { Box, Group, Paper, Stack, Text } from "@mantine/core";

export interface TooltipEntry {
  key: string;
  color: string;
  value: number;
  driver: string;
}

interface ChartTooltipProps {
  label?: string | number;
  entries: TooltipEntry[];
}

export function ChartTooltip({ label, entries }: ChartTooltipProps) {
  const visible = entries.filter((e) => e.value !== 0 && !Number.isNaN(e.value));
  if (!visible.length) return null;
  return (
    <Paper withBorder shadow="sm" p="sm" radius="md" style={{ minWidth: 180 }}>
      <Text fw={600} fz="sm" mb="xs">{label}</Text>
      {visible.map((e) => (
        <Group key={e.key} gap="xs" mb={4} wrap="nowrap" align="flex-start">
          <Box mt={3} style={{ width: 10, height: 10, borderRadius: 2, background: e.color, flexShrink: 0 }} />
          <Stack gap={0}>
            <Text fz="xs" fw={600}>{e.key}</Text>
            <Text fz="xs" c="dimmed">{e.driver}</Text>
            <Text fz="xs" fw={700}>{e.value.toFixed(2)} km/L</Text>
          </Stack>
        </Group>
      ))}
    </Paper>
  );
}
