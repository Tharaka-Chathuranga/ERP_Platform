import { Badge, Button, Card, Loader, SimpleGrid, Stack, Text } from "@mantine/core";
import { IconPlus } from "@tabler/icons-react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { PageHeader } from "../../components/PageHeader";
import { StatusBadge } from "../../components/StatusBadge";
import { listDeviations } from "../../api/store/deviations";
import type { DeviationRequest, DeviationStage } from "../../types";

const STAGES: { stage: DeviationStage; title: string }[] = [
  { stage: "INCOMING", title: "Incoming" },
  { stage: "IN_PROGRESS", title: "In progress" },
  { stage: "FINAL", title: "Final" },
];

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
        {STAGES.map((s) => (
          <StageColumn key={s.stage} stage={s.stage} title={s.title} />
        ))}
      </SimpleGrid>
    </div>
  );
}

function StageColumn({ stage, title }: { stage: DeviationStage; title: string }) {
  const navigate = useNavigate();
  const { data, isLoading } = useQuery({
    queryKey: ["deviations", stage],
    queryFn: () => listDeviations(stage),
  });

  return (
    <Card withBorder radius="md" padding="md" bg="var(--mantine-color-gray-0)">
      <Text fw={600} mb="sm">
        {title}{" "}
        <Badge variant="light" ml={4}>
          {data?.length ?? 0}
        </Badge>
      </Text>
      <Stack gap="sm">
        {isLoading && <Loader size="sm" />}
        {data?.length === 0 && (
          <Text c="dimmed" size="sm">
            Nothing here.
          </Text>
        )}
        {data?.map((d) => (
          <DeviationCard key={d.id} d={d} onClick={() => navigate(`/defects/${d.id}`)} />
        ))}
      </Stack>
    </Card>
  );
}

function DeviationCard({ d, onClick }: { d: DeviationRequest; onClick: () => void }) {
  return (
    <Card withBorder radius="sm" padding="sm" onClick={onClick} style={{ cursor: "pointer" }}>
      <Stack gap={6}>
        <StatusBadge status={d.status} />
        <Text size="sm" lineClamp={2}>
          {d.reason || "No reason provided"}
        </Text>
        <Text size="xs" c="dimmed">
          {d.items.length} item{d.items.length === 1 ? "" : "s"}
        </Text>
      </Stack>
    </Card>
  );
}
