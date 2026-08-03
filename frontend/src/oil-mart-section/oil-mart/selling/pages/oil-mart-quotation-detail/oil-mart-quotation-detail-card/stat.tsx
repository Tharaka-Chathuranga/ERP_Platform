import { Stack, Text } from "@mantine/core";
import type { ReactNode } from "react";

export function Stat({ label, value }: { label: string; value: ReactNode }) {
  return (
    <Stack gap={2}>
      <Text size="xs" c="dimmed" tt="uppercase" fw={600}>
        {label}
      </Text>
      <Text component="div" fw={700} fz={20} lh={1.2}>
        {value}
      </Text>
    </Stack>
  );
}
