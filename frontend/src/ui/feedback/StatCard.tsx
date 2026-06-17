import { Card, Group, Text, ThemeIcon } from "@mantine/core";
import { useHover } from "@mantine/hooks";
import type { ReactNode } from "react";
import { useNavigate } from "react-router-dom";

interface StatCardProps {
  label: string;
  value: ReactNode;
  icon: ReactNode;
  color?: string;
  to?: string;
  hint?: string;
}

export function StatCard({ label, value, icon, color = "brand", to, hint }: StatCardProps) {
  const navigate = useNavigate();
  const { hovered, ref } = useHover();
  const interactive = Boolean(to);
  const lifted = interactive && hovered;

  return (
    <Card
      ref={ref}
      withBorder
      padding="lg"
      radius="md"
      shadow={lifted ? "md" : "xs"}
      onClick={to ? () => navigate(to) : undefined}
      style={{
        cursor: interactive ? "pointer" : "default",
        transform: lifted ? "translateY(-2px)" : "none",
        transition: "transform 150ms ease, box-shadow 150ms ease",
      }}
    >
      <Group justify="space-between" align="flex-start" wrap="nowrap">
        <div style={{ minWidth: 0 }}>
          <Text size="xs" c="dimmed" tt="uppercase" fw={600} truncate style={{ letterSpacing: "0.05em" }}>
            {label}
          </Text>
          <Text fw={700} fz={30} lh={1.1} mt={6} style={{ fontVariantNumeric: "tabular-nums" }}>
            {value}
          </Text>
          {hint && (
            <Text size="xs" c="dimmed" mt={6} truncate>
              {hint}
            </Text>
          )}
        </div>
        <ThemeIcon color={color} variant="light" size={44} radius="md">
          {icon}
        </ThemeIcon>
      </Group>
    </Card>
  );
}
