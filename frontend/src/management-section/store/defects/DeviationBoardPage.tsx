import { Badge, Box, Button, Card, Group, Loader, SimpleGrid, Stack, Text, ThemeIcon } from "@mantine/core";
import { IconCircleCheck, IconPackageImport, IconPlus, IconProgress } from "@tabler/icons-react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import dayjs from "dayjs";
import { PageHeader } from "@ui/layout/PageHeader";
import { StatusBadge } from "@ui/feedback/StatusBadge";
import { listDeviations } from "@store/defects/deviations.api";
import type { DeviationRequest, DeviationStage } from "@core/types";

const STAGE_META: Record<DeviationStage, { title: string; color: string; icon: React.ReactNode }> = {
  INCOMING:    { title: "Incoming",    color: "indigo", icon: <IconPackageImport size={16} /> },
  IN_PROGRESS: { title: "In progress", color: "grape",  icon: <IconProgress size={16} /> },
  FINAL:       { title: "Final",       color: "cyan",   icon: <IconCircleCheck size={16} /> },
};

const STAGES: DeviationStage[] = ["INCOMING", "IN_PROGRESS", "FINAL"];

export function DeviationBoardPage() {
  const navigate = useNavigate();

  return (
    <div>
      <PageHeader
        title="Defects"
        actions={
          <Button leftSection={<IconPlus size={16} />} onClick={() => navigate("/defects/new")}>
            Report defect
          </Button>
        }
      />

      <SimpleGrid cols={{ base: 1, md: 3 }}>
        {STAGES.map((stage) => (
          <StageColumn key={stage} stage={stage} />
        ))}
      </SimpleGrid>
    </div>
  );
}

function StageColumn({ stage }: { stage: DeviationStage }) {
  const navigate = useNavigate();
  const meta = STAGE_META[stage];

  const { data, isLoading } = useQuery({
    queryKey: ["deviations", stage],
    queryFn: () => listDeviations(stage),
  });

  return (
    <Card withBorder radius="md" padding={0} style={{ overflow: "hidden" }}>
      {/* Coloured top accent */}
      <Box h={4} bg={`var(--mantine-color-${meta.color}-5)`} />

      {/* Column header */}
      <Group justify="space-between" px="md" py="sm" bg="var(--mantine-color-default-hover)">
        <Group gap="xs">
          <ThemeIcon size="sm" variant="light" color={meta.color} radius="xl">
            {meta.icon}
          </ThemeIcon>
          <Text fw={600} size="sm">{meta.title}</Text>
        </Group>
        <Badge variant="light" color={meta.color} size="sm">
          {data?.length ?? 0}
        </Badge>
      </Group>

      {/* Cards */}
      <Stack gap="xs" p="sm">
        {isLoading && (
          <Group justify="center" py="md">
            <Loader size="sm" color={meta.color} />
          </Group>
        )}
        {!isLoading && data?.length === 0 && (
          <Text c="dimmed" size="sm" ta="center" py="md">
            No defects here
          </Text>
        )}
        {data?.map((d) => (
          <DeviationCard key={d.id} d={d} stageColor={meta.color} onClick={() => navigate(`/defects/${d.id}`)} />
        ))}
      </Stack>
    </Card>
  );
}

function DeviationCard({ d, stageColor, onClick }: { d: DeviationRequest; stageColor: string; onClick: () => void }) {
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
          <Text size="xs" c="dimmed">{dayjs(d.requestedAt).format("MMM D")}</Text>
        </Group>

        <Text size="sm" c={d.reason ? undefined : "dimmed"} lineClamp={2} style={{ fontStyle: d.reason ? undefined : "italic" }}>
          {d.reason || "No reason provided"}
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
