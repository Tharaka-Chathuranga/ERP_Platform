import { Stack, Text } from "@mantine/core";

export function Stat({ label, value, color }: { label: string; value: number; color?: string }) {
  return (
    <Stack gap={2}>
      <Text size="xs" c="dimmed" tt="uppercase" fw={600}>
        {label}
      </Text>
      <Text fw={700} size="lg" c={color}>
        {value}
      </Text>
    </Stack>
  );
}
