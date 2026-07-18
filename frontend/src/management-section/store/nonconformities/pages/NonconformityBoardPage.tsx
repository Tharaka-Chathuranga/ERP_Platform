import { Badge, Box, Button, Card, Group, Loader, SimpleGrid, Stack, Text, ThemeIcon } from "@mantine/core";
import { IconPlus } from "@tabler/icons-react";
import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import dayjs from "dayjs";
import { PageHeader } from "@ui/layout/PageHeader";
import { StatusBadge } from "@ui/feedback/StatusBadge";
import { TableToolbar } from "@ui/data/TableToolbar";
import { qk } from "@core/queryKeys";
import { listNonconformities } from "../api";
import { DETECTION_STAGE_META, DETECTION_STAGES } from "../components";
import type { DetectionStage, NonconformityReport, NonconformityStatus } from "@core/types";

const STATUS_OPTIONS: { value: string; label: string }[] = [
  { value: "", label: "All statuses" },
  { value: "RAISED", label: "Raised" },
  { value: "UNDER_REVIEW", label: "Under review" },
  { value: "DISPOSITIONED", label: "Dispositioned" },
  { value: "REJECTED", label: "Rejected" },
  { value: "CLOSED", label: "Closed" },
];

type DateRange = [Date | null, Date | null];

interface BoardFilters {
  status: string;
  dateRange: DateRange;
}

const EMPTY_FILTERS: BoardFilters = { status: "", dateRange: [null, null] };

/** Apply the board-level status/date filters to a stage's reports. */
function applyFilters(items: NonconformityReport[], filters: BoardFilters): NonconformityReport[] {
  const [from, to] = filters.dateRange;

  return items.filter((d) => {
    if (filters.status && d.status !== (filters.status as NonconformityStatus)) return false;
    if (from && dayjs(d.reportedAt).isBefore(dayjs(from), "day")) return false;
    if (to && dayjs(d.reportedAt).isAfter(dayjs(to), "day")) return false;
    return true;
  });
}

export function NonconformityBoardPage() {
  const navigate = useNavigate();
  const [filters, setFilters] = useState<BoardFilters>(EMPTY_FILTERS);

  return (
    <div>
      <PageHeader title="Nonconformity reports" />

      <TableToolbar
        actions={
          <Button leftSection={<IconPlus size={16} />} onClick={() => navigate("/nonconformities/new")}>
            Report nonconformity
          </Button>
        }
        filters={[
          {
            label: "Status",
            value: filters.status,
            onChange: (value) => setFilters((f) => ({ ...f, status: value })),
            options: STATUS_OPTIONS,
          },
          {
            type: "daterange",
            label: "Raised between",
            value: filters.dateRange,
            onChange: (value) => setFilters((f) => ({ ...f, dateRange: value })),
          },
        ]}
      />

      <SimpleGrid cols={{ base: 1, md: 3 }}>
        {DETECTION_STAGES.map((stage) => (
          <StageColumn key={stage} stage={stage} filters={filters} />
        ))}
      </SimpleGrid>
    </div>
  );
}

function StageColumn({ stage, filters }: { stage: DetectionStage; filters: BoardFilters }) {
  const navigate = useNavigate();
  const meta = DETECTION_STAGE_META[stage];

  const { data, isLoading } = useQuery({
    queryKey: qk.nonconformities(stage),
    queryFn: () => listNonconformities(stage),
  });

  const filtered = useMemo(() => applyFilters(data ?? [], filters), [data, filters]);

  return (
    <Card withBorder radius="md" padding={0} style={{ overflow: "hidden" }}>
      <Box h={4} bg={`var(--mantine-color-${meta.color}-5)`} />

      <Group justify="space-between" px="md" py="sm" bg="var(--mantine-color-default-hover)">
        <Group gap="xs">
          <ThemeIcon size="sm" variant="light" color={meta.color} radius="xl">
            {meta.icon}
          </ThemeIcon>
          <Text fw={600} size="sm">{meta.title}</Text>
        </Group>
        <Badge variant="light" color={meta.color} size="sm">
          {filtered.length}
        </Badge>
      </Group>

      <Stack gap="xs" p="sm">
        {isLoading && (
          <Group justify="center" py="md">
            <Loader size="sm" color={meta.color} />
          </Group>
        )}
        {!isLoading && filtered.length === 0 && (
          <Text c="dimmed" size="sm" ta="center" py="md">
            Nothing here
          </Text>
        )}
        {filtered.map((d) => (
          <ReportCard key={d.id} d={d} stageColor={meta.color} onClick={() => navigate(`/nonconformities/${d.id}`)} />
        ))}
      </Stack>
    </Card>
  );
}

function ReportCard({ d, stageColor, onClick }: { d: NonconformityReport; stageColor: string; onClick: () => void }) {
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
