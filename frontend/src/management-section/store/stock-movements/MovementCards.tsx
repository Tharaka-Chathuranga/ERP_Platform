import { Badge, Card, Group, Stack, Text, ThemeIcon } from "@mantine/core";
import { IconArrowRight, IconClipboardList } from "@tabler/icons-react";
import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { EmptyState } from "@ui/feedback/EmptyState";
import type { ItemMovement, MovementTotals } from "./movementStats";

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
    <Card withBorder radius="md" padding="lg" h="100%">
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
          <Group justify="space-between" px={4} pb={6}>
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
            <Group
              key={r.itemId}
              justify="space-between"
              px={4}
              py={8}
              style={{ borderTop: "1px solid var(--mantine-color-default-border)" }}
            >
              <Text fw={500}>{itemCode(r.itemId)}</Text>
              <Group gap="xl">
                <Text c="teal.7" w={48} ta="right">
                  {fmt(r.in)}
                </Text>
                <Text c="red.7" w={48} ta="right">
                  {fmt(r.out)}
                </Text>
                <Group w={56} justify="flex-end">
                  <Badge color={r.ratio >= 1 ? "red" : "gray"} variant="light" radius="sm">
                    {Number.isFinite(r.ratio) ? r.ratio.toFixed(2) : "∞"}
                  </Badge>
                </Group>
              </Group>
            </Group>
          ))}
        </Stack>
      )}
    </SectionCard>
  );
}

/** The aggregate counts for the selected period. */
export function SummaryCard({ totals }: { totals: MovementTotals }) {
  const rows: { label: string; value: number; color?: string; signed?: boolean }[] = [
    { label: "Items moved", value: totals.itemsMoved },
    { label: "Movements", value: totals.count },
    { label: "Total in", value: totals.in, color: "teal.7" },
    { label: "Total out", value: totals.out, color: "red.7" },
    { label: "Net change", value: totals.net, color: totals.net >= 0 ? "teal.7" : "red.7", signed: true },
  ];
  return (
    <SectionCard title="Summary">
      <Stack gap="sm">
        {rows.map((r) => (
          <Group key={r.label} justify="space-between">
            <Text c="dimmed">{r.label}</Text>
            <Text fw={700} c={r.color}>
              {r.signed && r.value > 0 ? "+" : ""}
              {fmt(r.value)}
            </Text>
          </Group>
        ))}
      </Stack>
    </SectionCard>
  );
}

/** Clickable card that routes to the full movement-detail log. */
export function MovementLogNavCard({ to, count }: { to: string; count: number }) {
  return (
    <Card
      component={Link}
      to={to}
      withBorder
      radius="md"
      padding="lg"
      style={{ cursor: "pointer", textDecoration: "none" }}
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
        <ThemeIcon color="gray" variant="subtle" size={32} radius="md">
          <IconArrowRight size={20} />
        </ThemeIcon>
      </Group>
    </Card>
  );
}
