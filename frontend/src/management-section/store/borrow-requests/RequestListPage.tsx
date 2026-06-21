import { useState } from "react";
import { Button } from "@mantine/core";
import { IconPlus } from "@tabler/icons-react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import dayjs from "dayjs";
import { PageHeader } from "@ui/layout/PageHeader";
import { StatusBadge } from "@ui/feedback/StatusBadge";
import { EmptyState } from "@ui/feedback/EmptyState";
import { DataTable, TableToolbar, PersonCell, type Column } from "@ui/data";
import { useUserLabels } from "@core/hooks/useLookups";
import { listBorrowRequests } from "@store/borrow-requests/borrowRequests.api";
import type { BorrowRequest, BorrowRequestStatus } from "@core/types";
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

  const { data, isLoading, error } = useQuery({
    queryKey: ["borrowRequests", filter],
    queryFn: () => listBorrowRequests(filter === "ALL" ? undefined : (filter as BorrowRequestStatus)),
  });

  const columns: Column<BorrowRequest>[] = [
    {
      header: "Requested by",
      render: (r) => <PersonCell name={userLabel(r.requestedByUserId)} />,
    },
    { header: "Reason", render: (r) => r.reason || "—" },
    { header: "Requested", render: (r) => dayjs(r.requestedAt).format("MMM DD, YYYY") },
    { header: "Status", render: (r) => <StatusBadge status={r.status} /> },
  ];

  return (
    <div>
      <PageHeader title="Borrow Requests" />

      <TableToolbar
        filters={[{ label: "Status", value: filter, onChange: setFilter, options: FILTERS }]}
        actions={
          <Button leftSection={<IconPlus size={16} />} onClick={() => setNewOpen(true)}>
            New borrow request
          </Button>
        }
      />

      <DataTable
        columns={columns}
        data={data}
        rowKey={(r) => r.id}
        onRowClick={(r) => navigate(`/requests/${r.id}`)}
        loading={isLoading}
        error={error}
        empty={
          <EmptyState
            title="No borrow requests"
            description="Borrow requests will appear here for processing."
          />
        }
      />

      <NewBorrowRequestModal opened={newOpen} onClose={() => setNewOpen(false)} />
    </div>
  );
}
