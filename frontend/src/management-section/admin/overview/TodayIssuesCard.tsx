import { Text } from "@mantine/core";
import { IconPackageExport } from "@tabler/icons-react";
import { useQuery } from "@tanstack/react-query";
import dayjs from "dayjs";
import { useNavigate } from "react-router-dom";
import { qk } from "@core/queryKeys";
import { useUserLabels } from "@core/hooks/useLookups";
import { DataTable } from "@ui/data/DataTable";
import { StackedCell } from "@ui/data/cells";
import type { TodayIssueRow } from "@core/types";
import { getTodayIssues } from "../admin.api";
import { OverviewCard } from "./OverviewCard";
import { money } from "./format";

/** Lists every issue document physically issued today. */
export function TodayIssuesCard() {
  const navigate = useNavigate();
  const userLabel = useUserLabels();
  const issues = useQuery({ queryKey: qk.todayIssues(), queryFn: getTodayIssues });

  return (
    <OverviewCard
      title="Today's issuing"
      description="Goods issued so far today"
      icon={<IconPackageExport size={22} />}
      accent="grape"
      count={issues.data?.length}
    >
      <DataTable<TodayIssueRow>
        data={issues.data}
        loading={issues.isLoading}
        error={issues.error}
        withCard={false}
        rowKey={(r) => r.issueId}
        onRowClick={(r) => navigate(`/issuing/${r.issueId}`)}
        empty={<Text c="dimmed" p="md">Nothing issued yet today.</Text>}
        columns={[
          {
            header: "Issue",
            render: (r) => <StackedCell primary={r.issueNumber} secondary={userLabel(r.borrowingUserId)} />,
            emphasis: true,
          },
          { header: "Lines", render: (r) => r.lineCount, align: "right" },
          { header: "Qty", render: (r) => r.totalQuantity, align: "right" },
          { header: "Value", render: (r) => money(r.totalValue), align: "right" },
          { header: "Time", render: (r) => dayjs(r.issuedAt).format("HH:mm"), align: "right" },
        ]}
      />
    </OverviewCard>
  );
}
