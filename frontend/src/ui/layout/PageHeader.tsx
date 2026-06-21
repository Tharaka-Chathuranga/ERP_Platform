import { Group, Title } from "@mantine/core";
import { type ReactNode } from "react";

interface PageHeaderProps {
  title: string;
  actions?: ReactNode;
}

export function PageHeader({ title, actions }: PageHeaderProps) {
  return (
    <div style={{ marginBottom: "var(--mantine-spacing-lg)" }}>
      <Title order={2} fw={700} py="sm">
        {title}
      </Title>
      {actions && (
        <Group justify="flex-end" gap="sm" pt="md">
          {actions}
        </Group>
      )}
    </div>
  );
}
