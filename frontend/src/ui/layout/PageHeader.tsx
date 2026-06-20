import { Group, Title } from "@mantine/core";
import { type ReactNode } from "react";

interface PageHeaderProps {
  title: string;
  actions?: ReactNode;
}

export function PageHeader({ title, actions }: PageHeaderProps) {
  return (
    <Group justify="space-between" align="center" mb="lg" wrap="wrap">
      <Title order={2} fw={700}>
        {title}
      </Title>
      {actions && <Group gap="sm">{actions}</Group>}
    </Group>
  );
}
