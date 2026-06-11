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
      padding="lg"
      radius="md"
      onClick={to ? () => navigate(to) : undefined}
      style={{ cursor: to ? "pointer" : "default", height: "100%" }}
    >
      <Group justify="space-between" align="flex-start" wrap="nowrap">
        <div>
          <Text size="xs" c="dimmed" tt="uppercase" fw={600}>
            {label}
          </Text>
          <Text fw={700} size="28px" mt={4}>
            {value}
          </Text>
          {hint && (
            <Text size="xs" c="dimmed" mt={4}>
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
