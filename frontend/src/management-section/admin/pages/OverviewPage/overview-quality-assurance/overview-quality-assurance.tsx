import { Button, Group, SimpleGrid, Stack, Text, Title } from "@mantine/core";
import {
  IconAlertTriangle,
  IconArrowsExchange,
  IconBug,
  IconCheck,
  IconClipboardCheck,
  IconThumbUp,
  IconX,
} from "@tabler/icons-react";
import { useNavigate } from "react-router-dom";
import { StatCard } from "@ui/feedback/StatCard";
import { WelcomeBanner } from "../welcome-banner";
import { SectionDivider } from "../section-divider";
import { useQualityAssuranceOverview } from "./use-quality-assurance-overview";

export function QualityAssuranceOverview() {
  const navigate = useNavigate();
  const { username, s } = useQualityAssuranceOverview();

  return (
    <Stack gap="xl">

      <WelcomeBanner>
        <Group justify="space-between" align="flex-end" wrap="wrap" gap="md">
          <div>
            <Title order={2} fw={700} mb={4}>
              👋 Welcome back, {username}
            </Title>
            <Text c="dimmed" fz="sm">
              Review and action open nonconformity reports.
            </Text>
          </div>
          <Button onClick={() => navigate("/qa/nonconformities")}>Review nonconformities</Button>
        </Group>
      </WelcomeBanner>

      <div>
        <SectionDivider label="Outcomes" />
        <SimpleGrid cols={{ base: 1, sm: 4 }}>
          <StatCard label="Awaiting review" value={(s?.raisedCount ?? 0) + (s?.underReviewCount ?? 0)} icon={<IconAlertTriangle size={22} />} color="yellow" to="/qa/nonconformities" hint="Awaiting your decision" />
          <StatCard label="Dispositioned" value={s?.dispositionedCount ?? 0} icon={<IconCheck size={22} />} color="green" />
          <StatCard label="Rejected" value={s?.rejectedCount ?? 0} icon={<IconX size={22} />} color="red" />
          <StatCard label="Closed" value={s?.closedCount ?? 0} icon={<IconThumbUp size={22} />} color="teal" />
        </SimpleGrid>
      </div>

      <div>
        <SectionDivider label="Pipeline stages" />
        <SimpleGrid cols={{ base: 1, sm: 3 }}>
          <StatCard label="Incoming" value={s?.incomingCount ?? 0} icon={<IconBug size={22} />} color="grape" hint="Workflow stage" />
          <StatCard label="In progress" value={s?.inProgressCount ?? 0} icon={<IconArrowsExchange size={22} />} color="indigo" hint="Workflow stage" />
          <StatCard label="Final" value={s?.finalCount ?? 0} icon={<IconClipboardCheck size={22} />} color="teal" hint="Workflow stage" />
        </SimpleGrid>
      </div>
    </Stack>
  );
}
