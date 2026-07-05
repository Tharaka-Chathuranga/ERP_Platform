import { Text } from "@mantine/core";
import { IconPackageExport } from "@tabler/icons-react";
import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import dayjs from "dayjs";
import { useNavigate } from "react-router-dom";
import { qk } from "@core/queryKeys";
import { useUserLabels } from "@core/hooks/useLookups";
import { DataTable, TableToolbar } from "@ui/data";
import { StackedCell } from "@ui/data/cells";
import type { TodayIssueRow } from "@core/types";
import { getTodayIssues } from "../admin.api";
import { OverviewCard } from "./OverviewCard";
import { money } from "./format";

export function TodayIssuesCard() {
  const navigate = useNavigate();
  const userLabel = useUserLabels();
  const issues = useQuery({ queryKey: qk.todayIssues(), queryFn: getTodayIssues });
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return issues.data;
    return (issues.data ?? []).filter(
      (r) => r.issueNumber.toLowerCase().includes(q) || userLabel(r.borrowingUserId).toLowerCase().includes(q),
    );
  }, [issues.data, search, userLabel]);

  return (
    <OverviewCard
      title="Today's issuing"
      icon={<IconPackageExport size={22} />}
      accent="grape"
      count={issues.data?.length}
      toolbar={
        <TableToolbar search={{ value: search, onChange: setSearch, placeholder: "Search issue or user…" }} />
      }
    >
      <DataTable<TodayIssueRow>
        data={filtered}
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
