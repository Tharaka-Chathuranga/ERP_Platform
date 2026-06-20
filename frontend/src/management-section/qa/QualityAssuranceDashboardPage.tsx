import { SimpleGrid } from "@mantine/core";
import {
  IconAlertTriangle,
  IconArrowsExchange,
  IconBug,
  IconCheck,
  IconClipboardCheck,
  IconX,
} from "@tabler/icons-react";
import { useQuery } from "@tanstack/react-query";
import { qk } from "@core/queryKeys";
import { StatCard } from "@ui/feedback/StatCard";
import { PageHeader } from "@ui/layout/PageHeader";
import { getQaDefectSummary } from "./qa.api";

export function QualityAssuranceDashboardPage() {
  const summary = useQuery({ queryKey: qk.qaDefectSummary(), queryFn: getQaDefectSummary });
  const s = summary.data;

  return (
    <div>
      <PageHeader title="Quality assurance" />

      <SimpleGrid cols={{ base: 1, sm: 2, lg: 3 }}>
        <StatCard
          label="Pending review"
          value={s?.pendingCount ?? 0}
          icon={<IconAlertTriangle size={22} />}
          color="yellow"
          to="/qa/defects"
          hint="Awaiting your decision"
        />
        <StatCard
          label="Approved"
          value={s?.approvedCount ?? 0}
          icon={<IconCheck size={22} />}
          color="green"
        />
        <StatCard
          label="Rejected"
          value={s?.rejectedCount ?? 0}
          icon={<IconX size={22} />}
          color="red"
        />
        <StatCard
          label="Incoming"
          value={s?.incomingCount ?? 0}
          icon={<IconBug size={22} />}
          color="grape"
          hint="Workflow stage"
        />
        <StatCard
          label="In progress"
          value={s?.inProgressCount ?? 0}
          icon={<IconArrowsExchange size={22} />}
          color="indigo"
          hint="Workflow stage"
        />
        <StatCard
          label="Final"
          value={s?.finalCount ?? 0}
          icon={<IconClipboardCheck size={22} />}
          color="teal"
          hint="Workflow stage"
        />
      </SimpleGrid>
    </div>
  );
}
