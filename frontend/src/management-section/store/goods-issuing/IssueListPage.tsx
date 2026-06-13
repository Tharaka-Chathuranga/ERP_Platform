import { useMemo, useState } from "react";
import { Button, Group, SegmentedControl, TextInput } from "@mantine/core";
import { IconPlus, IconSearch } from "@tabler/icons-react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import dayjs from "dayjs";
import { PageHeader } from "@ui/layout/PageHeader";
import { StatusBadge } from "@ui/feedback/StatusBadge";
import { EmptyState } from "@ui/feedback/EmptyState";
import { DataTable, PersonCell, StackedCell, type Column } from "@ui/data";
import { useUsers } from "@core/hooks/useUsers";
import { listIssues } from "@store/goods-issuing/issuing.api";
import type { Issue, IssueStatus, UserSummary } from "@core/types";

const FILTERS: { label: string; value: string }[] = [
  { label: "All", value: "ALL" },
  { label: "Pending", value: "PENDING_APPROVAL" },
  { label: "Approved", value: "APPROVED" },
  { label: "Issued", value: "ISSUED" },
];

export function IssueListPage() {
  const navigate = useNavigate();
  const [filter, setFilter] = useState("ALL");
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const { data, isLoading, error } = useQuery({
    queryKey: ["issues", filter],
    queryFn: () => listIssues(filter === "ALL" ? undefined : (filter as IssueStatus)),
  });

  const { data: users } = useUsers();
  const userById = useMemo(() => {
    const map = new Map<string, UserSummary>();
    users?.forEach((u) => map.set(u.id, u));
    return map;
  }, [users]);
  const nameOf = (id: string) => {
    const u = userById.get(id);
    return u?.displayName || u?.username || id.slice(0, 8);
  };

  const term = search.trim().toLowerCase();
  const rows = (data?.content ?? []).filter(
    (i) =>
      !term ||
      i.issueNumber.toLowerCase().includes(term) ||
      nameOf(i.borrowingUserId).toLowerCase().includes(term),
  );

  const columns: Column<Issue>[] = [
    {
      header: "Borrowing user",
      render: (i) => (
        <PersonCell
          name={nameOf(i.borrowingUserId)}
          subtitle={userById.get(i.borrowingUserId)?.department ?? "No department"}
        />
      ),
    },
    {
      header: "Issue",
      render: (i) => (
        <StackedCell
          primary={i.issueNumber}
          secondary={`${i.lines.length} ${i.lines.length === 1 ? "item" : "items"}`}
        />
      ),
    },
    { header: "Store keeper", render: (i) => nameOf(i.storeKeeperId) },
    { header: "Status", render: (i) => <StatusBadge status={i.status} /> },
    {
      header: "Activity",
      render: (i) => {
        const when = i.issuedAt ?? i.approvedAt;
        return when ? (
          <StackedCell
            primary={dayjs(when).format("MMM DD, YYYY")}
            secondary={dayjs(when).format("h:mm A")}
          />
        ) : (
          "—"
        );
      },
    },
  ];

  return (
    <div>
      <PageHeader
        title="Goods Issue"
        actions={
          <Button leftSection={<IconPlus size={16} />} onClick={() => navigate("/issuing/new")}>
            New goods issue
          </Button>
        }
      />

      <Group gap="sm" mb="md">
        <SegmentedControl data={FILTERS} value={filter} onChange={setFilter} />
        <TextInput
          leftSection={<IconSearch size={16} />}
          placeholder="Search issue № or user…"
          value={search}
          onChange={(e) => setSearch(e.currentTarget.value)}
          w={260}
        />
      </Group>

      <DataTable
        columns={columns}
        data={rows}
        rowKey={(i) => i.id}
        onRowClick={(i) => navigate(`/issuing/${i.id}`)}
        loading={isLoading}
        error={error}
        selection={{ selected, onChange: setSelected }}
        empty={
          <EmptyState
            title="No goods issues"
            description={
              term ? "No issues match your search." : "Issue stock to a user to get started."
            }
          />
        }
      />
    </div>
  );
}
