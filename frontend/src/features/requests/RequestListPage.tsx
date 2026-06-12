import { useState } from "react";
import { Button, Card, Loader, SegmentedControl, Table } from "@mantine/core";
import { IconPlus } from "@tabler/icons-react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import dayjs from "dayjs";
import { PageHeader } from "../../components/PageHeader";
import { StatusBadge } from "../../components/StatusBadge";
import { EmptyState } from "../../components/EmptyState";
import { useUserLabels } from "../../hooks/useLookups";
import { listBorrowRequests } from "../../api/store/borrowRequests";
import type { BorrowRequestStatus } from "../../types";
import { NewBorrowRequestModal } from "./NewBorrowRequestModal";

const FILTERS = [
  { label: "All", value: "ALL" },
  { label: "Pending", value: "PENDING" },
  { label: "Approved", value: "APPROVED" },
  { label: "Rejected", value: "REJECTED" },
];

export function RequestListPage() {
  const navigate = useNavigate();
  const userLabel = useUserLabels();
  const [filter, setFilter] = useState("ALL");
  const [newOpen, setNewOpen] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ["borrowRequests", filter],
    queryFn: () => listBorrowRequests(filter === "ALL" ? undefined : (filter as BorrowRequestStatus)),
  });

  return (
    <div>
      <PageHeader
        title="Requests"
        actions={
          <Button leftSection={<IconPlus size={16} />} onClick={() => setNewOpen(true)}>
            New request
          </Button>
        }
      />

      <SegmentedControl data={FILTERS} value={filter} onChange={setFilter} mb="md" />

      <Card withBorder radius="md" padding="lg">
        {isLoading ? (
          <Loader />
        ) : !data || data.length === 0 ? (
          <EmptyState title="No requests" description="Borrow requests will appear here for processing." />
        ) : (
          <Table highlightOnHover>
            <Table.Thead>
              <Table.Tr>
                <Table.Th>Requested by</Table.Th>
                <Table.Th>Reason</Table.Th>
                <Table.Th>Requested</Table.Th>
                <Table.Th>Status</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {data.map((r) => (
                <Table.Tr
                  key={r.id}
                  style={{ cursor: "pointer" }}
                  onClick={() => navigate(`/requests/${r.id}`)}
                >
                  <Table.Td>{userLabel(r.requestedByUserId)}</Table.Td>
                  <Table.Td>{r.reason || "—"}</Table.Td>
                  <Table.Td>{dayjs(r.requestedAt).format("YYYY-MM-DD")}</Table.Td>
                  <Table.Td>
                    <StatusBadge status={r.status} />
                  </Table.Td>
                </Table.Tr>
              ))}
            </Table.Tbody>
          </Table>
        )}
      </Card>

      <NewBorrowRequestModal opened={newOpen} onClose={() => setNewOpen(false)} />
    </div>
  );
}
