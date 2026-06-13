import { Avatar, Group, Stack, Text } from "@mantine/core";
import type { ReactNode } from "react";

/** "Jhon Clavio" → "JC"; falls back to "?" for empty names. */
function initials(name: string): string {
  const parts = name.trim().split(/\s+/);
  return ((parts[0]?.[0] ?? "") + (parts[1]?.[0] ?? "")).toUpperCase() || "?";
}

/** Bold primary line over a dimmed secondary line — the standard list cell. */
export function StackedCell({
  primary,
  secondary,
}: {
  primary: ReactNode;
  secondary?: ReactNode;
}) {
  return (
    <Stack gap={0}>
      <Text fw={600} size="sm" lh={1.2}>
        {primary}
      </Text>
      {secondary != null && (
        <Text c="dimmed" size="xs">
          {secondary}
        </Text>
      )}
    </Stack>
  );
}

/** Avatar (initials) beside a name and an optional dimmed subtitle. */
export function PersonCell({
  name,
  subtitle,
}: {
  name: string;
  subtitle?: ReactNode;
}) {
  return (
    <Group gap="sm" wrap="nowrap">
      <Avatar color="brand" radius="xl" size={38}>
        {initials(name)}
      </Avatar>
      <StackedCell primary={name} secondary={subtitle} />
    </Group>
  );
}
