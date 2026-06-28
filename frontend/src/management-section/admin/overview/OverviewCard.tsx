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
  /** Mantine colour for the icon and the count badge. */
  accent: string;
  /** Total count shown in the header badge (the list itself may be capped). */
  count?: number;
  /** Rendered between the header and the scroll area (e.g. search / filter bar). */
  toolbar?: ReactNode;
  children: ReactNode;
}

/** Max height of the inline scroll area before the body starts scrolling. */
const BODY_MAX_HEIGHT = 320;

/**
 * Shared shell for the overview panels: a titled, bordered card with an accent
 * icon, optional description and a count badge. The body is a fixed-height
 * scroll area, and an expand control in the header opens a fullscreen focus
 * modal that re-renders the same content uncapped. Keeps every overview section
 * visually consistent and the panel components focused on their table content.
 */
export function OverviewCard({ title, description, icon, accent, count, toolbar, children }: OverviewCardProps) {
  const [expanded, { open, close }] = useDisclosure(false);

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
            {children}
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
        {children}
      </Modal>
    </>
  );
}
