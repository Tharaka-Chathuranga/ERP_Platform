import { Card, Group, Stack, Text } from "@mantine/core";
import dayjs from "dayjs";
import { StatusBadge } from "@ui/feedback/StatusBadge";
import type { NonconformityReport } from "@core/types";

export function ReportCard({
  d,
  stageColor,
  onClick,
}: {
  d: NonconformityReport;
  stageColor: string;
  onClick: () => void;
}) {
  return (
    <Card
      withBorder
      radius="md"
      padding="sm"
      onClick={onClick}
      style={{
        cursor: "pointer",
        transition: "box-shadow 0.15s, transform 0.1s",
        borderLeft: `3px solid var(--mantine-color-${stageColor}-5)`,
      }}
      styles={{ root: { "&:hover": { boxShadow: "var(--mantine-shadow-sm)", transform: "translateY(-1px)" } } }}
    >
      <Stack gap={6}>
        <Group justify="space-between" wrap="nowrap">
          <StatusBadge status={d.status} />
          <Text size="xs" c="dimmed">{dayjs(d.reportedAt).format("MMM D")}</Text>
        </Group>

        <Text size="sm" c={d.description ? undefined : "dimmed"} lineClamp={2} style={{ fontStyle: d.description ? undefined : "italic" }}>
          {d.description || "No description provided"}
        </Text>

        <Text size="xs" c="dimmed">
          {d.items.length} item{d.items.length === 1 ? "" : "s"}
          {" · "}
          {d.items.reduce((s, it) => s + it.quantity, 0)} units
        </Text>
      </Stack>
    </Card>
  );
}
