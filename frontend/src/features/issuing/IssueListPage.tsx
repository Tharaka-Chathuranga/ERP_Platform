import { useState } from "react";
import { Button, Card, Loader, SegmentedControl, Table } from "@mantine/core";
import { IconPlus } from "@tabler/icons-react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { PageHeader } from "../../components/PageHeader";
import { StatusBadge } from "../../components/StatusBadge";
import { EmptyState } from "../../components/EmptyState";
import { useUserLabels } from "../../hooks/useLookups";
import { listIssues } from "../../api/store/issues";
import type { IssueStatus } from "../../types";

const FILTERS: { label: string; value: string }[] = [
  { label: "All", value: "ALL" },
  { label: "Pending", value: "PENDING_APPROVAL" },
  { label: "Approved", value: "APPROVED" },
  { label: "Issued", value: "ISSUED" },
];

export function IssueListPage() {
  const navigate = useNavigate();
  const userLabel = useUserLabels();
  const [filter, setFilter] = useState("ALL");

  const { data, isLoading } = useQuery({
    queryKey: ["issues", filter],
    queryFn: () => listIssues(filter === "ALL" ? undefined : (filter as IssueStatus)),
  });

  return (
    <div>
      <PageHeader
        title="Issuing"
        subtitle="Issue and borrow stock to users"
        actions={
          <Button leftSection={<IconPlus size={16} />} onClick={() => navigate("/issuing/new")}>
            New issue
          </Button>
        }
      />

      <SegmentedControl data={FILTERS} value={filter} onChange={setFilter} mb="md" />

      <Card withBorder radius="md" padding="lg">
        {isLoading ? (
          <Loader />
        ) : !data || data.content.length === 0 ? (
          <EmptyState title="No issues" description="Create an issue to give stock to a user." />
        ) : (
          <Table highlightOnHover>
            <Table.Thead>
              <Table.Tr>
                <Table.Th>Issue №</Table.Th>
                <Table.Th>Borrowing user</Table.Th>
                <Table.Th>Lines</Table.Th>
                <Table.Th>Status</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {data.content.map((i) => (
                <Table.Tr
                  key={i.id}
                  style={{ cursor: "pointer" }}
                  onClick={() => navigate(`/issuing/${i.id}`)}
                >
                  <Table.Td fw={600}>{i.issueNumber}</Table.Td>
                  <Table.Td>{userLabel(i.borrowingUserId)}</Table.Td>
                  <Table.Td>{i.lines.length}</Table.Td>
                  <Table.Td>
                    <StatusBadge status={i.status} />
                  </Table.Td>
                </Table.Tr>
              ))}
            </Table.Tbody>
          </Table>
        )}
      </Card>
    </div>
  );
}
