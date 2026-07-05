import {
  ActionIcon,
  Badge,
  Group,
  Modal,
  Paper,
  ScrollArea,
  Stack,
  Text,
  ThemeIcon,
  Tooltip,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { IconArrowsMaximize } from "@tabler/icons-react";
import type { ReactNode } from "react";

interface OverviewCardProps {
  title: string;
  description?: string;
  icon: ReactNode;
  accent: string;
  count?: number;
  toolbar?: ReactNode;
  children: ReactNode | ((expanded: boolean) => ReactNode);
}

const BODY_MAX_HEIGHT = 320;

export function OverviewCard({ title, description, icon, accent, count, toolbar, children }: OverviewCardProps) {
  const [expanded, { open, close }] = useDisclosure(false);
  const body = (isExpanded: boolean) => (typeof children === "function" ? children(isExpanded) : children);

  const heading = (
    <Group gap="sm" wrap="nowrap">
      <ThemeIcon variant="light" color={accent} radius="md" size={38}>
        {icon}
      </ThemeIcon>
      <div>
        <Text fw={600}>{title}</Text>
        {description && (
          <Text c="dimmed" fz="xs">
            {description}
          </Text>
        )}
      </div>
    </Group>
  );

  return (
    <>
      <Paper p="lg" radius="md" withBorder h="100%">
        <Stack gap="md">
          <Group justify="space-between" align="flex-start" wrap="nowrap">
            {heading}
            <Group gap="xs" wrap="nowrap">
              {count != null && (
                <Badge color={accent} variant="light" radius="sm" size="lg">
                  {count}
                </Badge>
              )}
              <Tooltip label="Open full screen" withArrow>
                <ActionIcon variant="subtle" color="gray" onClick={open} aria-label={`Expand ${title}`}>
                  <IconArrowsMaximize size={18} />
                </ActionIcon>
              </Tooltip>
            </Group>
          </Group>
          {toolbar}
          <ScrollArea.Autosize mah={BODY_MAX_HEIGHT} type="auto">
            {body(false)}
          </ScrollArea.Autosize>
        </Stack>
      </Paper>

      <Modal
        opened={expanded}
        onClose={close}
        fullScreen
        radius={0}
        title={heading}
        scrollAreaComponent={ScrollArea.Autosize}
      >
        {toolbar && <div style={{ padding: "0 0 12px" }}>{toolbar}</div>}
        {body(true)}
      </Modal>
    </>
  );
}
