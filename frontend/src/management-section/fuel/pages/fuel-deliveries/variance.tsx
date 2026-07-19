import { Text } from "@mantine/core";

export function Variance({ value, tolerance = 0 }: { value: number; tolerance?: number }) {
  const ok = Math.abs(value) <= tolerance;
  const sign = value > 0 ? "+" : "";
  return (
    <Text component="span" fw={600} c={ok ? "teal" : "orange"}>
      {ok ? "✓ 0" : `${sign}${value.toLocaleString()}`}
    </Text>
  );
}
