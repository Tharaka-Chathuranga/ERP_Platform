import { Card, Group, Text, ThemeIcon } from "@mantine/core";
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
  return (
    <Card
      withBorder
      padding="md"
      radius="md"
      onClick={to ? () => navigate(to) : undefined}
      style={{ cursor: to ? "pointer" : "default" }}
    >
      <Group justify="space-between" align="center" wrap="nowrap">
        <div style={{ minWidth: 0 }}>
          <Text size="xs" c="dimmed" tt="uppercase" fw={600} truncate>
            {label}
          </Text>
          <Text fw={700} size="26px" lh={1.1} mt={2}>
            {value}
          </Text>
          {hint && (
            <Text size="xs" c="dimmed" mt={2} truncate>
              {hint}
            </Text>
          )}
        </div>
        <ThemeIcon color={color} variant="light" size={36} radius="md">
          {icon}
        </ThemeIcon>
      </Group>
    </Card>
  );
}
