import { Badge, Box, Card, Group, Loader, Stack, Text, ThemeIcon } from "@mantine/core";
import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { qk } from "@core/queryKeys";
import type { DetectionStage } from "@core/types";
import { listNonconformities } from "../../../api";
import { DETECTION_STAGE_META } from "../../../components";
import type { BoardFilters } from "../hooks/use-nonconformity-board";
import { applyFilters } from "./apply-filters";
import { ReportCard } from "./report-card";

export function StageColumn({ stage, filters }: { stage: DetectionStage; filters: BoardFilters }) {
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
