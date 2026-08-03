import { Text } from "@mantine/core";

export function Field({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div>
      <Text size="xs" c="dimmed" tt="uppercase" fw={600}>
        {label}
      </Text>
      <Text>{value ?? "—"}</Text>
    </div>
  );
}
