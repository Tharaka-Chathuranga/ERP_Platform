import { Badge, Card, Group, Stack, Text, ThemeIcon } from "@mantine/core";
import { useHover } from "@mantine/hooks";
import { IconArrowRight, IconClipboardList } from "@tabler/icons-react";
import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { EmptyState } from "@ui/feedback/EmptyState";
import type { ItemMovement } from "../utils/movementStats";

const fmt = (n: number) => n.toLocaleString();

/** A titled, bordered card — the shared look used across the dashboard. */
export function SectionCard({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: ReactNode;
}) {
  return (
    <Card withBorder radius="md" padding="lg" shadow="xs" h="100%">
      <Text fw={600} mb={subtitle ? 4 : "md"}>
        {title}
      </Text>
      {subtitle && (
        <Text size="sm" c="dimmed" mb="md">
          {subtitle}
        </Text>
      )}
      {children}
    </Card>
  );
}

/** One item row in the mini-table: a full-bleed hover highlight that ignores
 *  the card padding, separated from the row above by a hairline rule. */
function TopItemRow({ row, itemCode }: { row: ItemMovement; itemCode: (id: string) => string }) {
  const { hovered, ref } = useHover();
  return (
    <Group
      ref={ref}
      justify="space-between"
      py={10}
      style={{
        marginInline: "calc(-1 * var(--mantine-spacing-lg))",
        paddingInline: "var(--mantine-spacing-lg)",
        borderTop: "1px solid var(--mantine-color-default-border)",
        backgroundColor: hovered ? "var(--mantine-color-default-hover)" : "transparent",
        transition: "background-color 120ms ease",
      }}
    >
      <Text fw={500}>{itemCode(row.itemId)}</Text>
      <Group gap="xl">
        <Text c="teal.7" w={48} ta="right" style={{ fontVariantNumeric: "tabular-nums" }}>
          {fmt(row.in)}
        </Text>
        <Text c="red.7" w={48} ta="right" style={{ fontVariantNumeric: "tabular-nums" }}>
          {fmt(row.out)}
        </Text>
        <Group w={56} justify="flex-end">
          <Badge color={row.ratio >= 1 ? "red" : "gray"} variant="light" radius="sm">
            {Number.isFinite(row.ratio) ? row.ratio.toFixed(2) : "∞"}
          </Badge>
        </Group>
      </Group>
    </Group>
  );
}

/** A five-row mini table of items with their In / Out / out·in ratio. */
export function TopItemsCard({
  title,
  subtitle,
  rows,
  itemCode,
  emptyTitle,
}: {
  title: string;
  subtitle?: string;
  rows: ItemMovement[];
  itemCode: (id: string) => string;
  emptyTitle: string;
}) {
  return (
    <SectionCard title={title} subtitle={subtitle}>
      {rows.length === 0 ? (
        <EmptyState title={emptyTitle} />
      ) : (
        <Stack gap={0}>
          <Group justify="space-between" pb={8}>
            <Text size="xs" c="dimmed" tt="uppercase" fw={600}>
              Item
            </Text>
            <Group gap="xl">
              <Text size="xs" c="dimmed" tt="uppercase" fw={600} w={48} ta="right">
                In
              </Text>
              <Text size="xs" c="dimmed" tt="uppercase" fw={600} w={48} ta="right">
                Out
              </Text>
              <Text size="xs" c="dimmed" tt="uppercase" fw={600} w={56} ta="right">
                Out/In
              </Text>
            </Group>
          </Group>
          {rows.map((r) => (
            <TopItemRow key={r.itemId} row={r} itemCode={itemCode} />
          ))}
        </Stack>
      )}
    </SectionCard>
  );
}

/** Clickable card that routes to the full movement-detail log. */
export function MovementLogNavCard({ to, count }: { to: string; count: number }) {
  const { hovered, ref } = useHover();
  return (
    <Card
      ref={ref}
      component={Link}
      to={to}
      withBorder
      radius="md"
      padding="lg"
      shadow={hovered ? "md" : "xs"}
      style={{
        textDecoration: "none",
        transform: hovered ? "translateY(-2px)" : "none",
        borderColor: hovered ? "var(--mantine-color-grape-4)" : undefined,
        transition: "transform 150ms ease, box-shadow 150ms ease, border-color 150ms ease",
      }}
    >
      <Group justify="space-between" wrap="nowrap">
        <Group wrap="nowrap">
          <ThemeIcon color="grape" variant="light" size={44} radius="md">
            <IconClipboardList size={24} />
          </ThemeIcon>
          <div>
            <Text fw={600} c="var(--mantine-color-text)">
              Movement detail log
            </Text>
            <Text size="sm" c="dimmed">
              Full filterable history of every stock movement ({fmt(count)} records).
            </Text>
          </div>
        </Group>
        <ThemeIcon
          color="gray"
          variant="subtle"
          size={32}
          radius="md"
          style={{
            transform: hovered ? "translateX(4px)" : "none",
            transition: "transform 150ms ease",
          }}
        >
          <IconArrowRight size={20} />
        </ThemeIcon>
      </Group>
    </Card>
  );
}
