import { Group, Stack, Text } from "@mantine/core";
import { IconPackageExport } from "@tabler/icons-react";
import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import dayjs from "dayjs";
import { useNavigate } from "react-router-dom";
import { qk } from "@core/queryKeys";
import { useUserLabels } from "@core/hooks/useLookups";
import { DataTable, TableToolbar, type Column } from "@ui/data";
import { StatusBadge } from "@ui/feedback/StatusBadge";
import { IssueStatusIcon } from "@store/goods-issuing";
import type { TodayIssueRow } from "@core/types";
import { getTodayIssues } from "../../api";
import { OverviewCard } from "./OverviewCard";

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
      {(expanded) => {
        const columns: Column<TodayIssueRow>[] = [
          { header: "Issue", render: (r) => r.issueNumber, emphasis: true },
          { header: "Receiver", render: (r) => userLabel(r.borrowingUserId) },
          { header: "Item types", render: (r) => r.itemTypeCount, align: "right" },
          {
            header: "Status",
            // Compact card: a status icon. Fullscreen: the full status label.
            render: (r) => (expanded ? <StatusBadge status={r.status} /> : <IssueStatusIcon status={r.status} />),
          },
          { header: "Time", render: (r) => (r.issuedAt ? dayjs(r.issuedAt).format("HH:mm") : "—"), align: "right" },
        ];
        return (
          <DataTable<TodayIssueRow>
            data={filtered}
            loading={issues.isLoading}
            error={issues.error}
            withCard={false}
            rowKey={(r) => r.issueId}
            onRowClick={(r) => navigate(`/issuing/${r.issueId}`)}
            empty={<Text c="dimmed" p="md">Nothing issued yet today.</Text>}
            columns={columns}
            expandable={
              expanded
                ? (r) => (
                    <Stack gap={4}>
                      {r.lines.map((l, i) => (
                        <Group key={i} justify="space-between" maw={360} wrap="nowrap">
                          <Text size="sm">{l.itemName}</Text>
                          <Text size="sm" c="dimmed">Qty {l.quantity}</Text>
                        </Group>
                      ))}
                    </Stack>
                  )
                : undefined
            }
          />
        );
      }}
    </OverviewCard>
  );
}
