import { EmptyState } from "@ui/feedback/EmptyState";
import { DataTable } from "@ui/data";
import type { BorrowRequest } from "@core/types";
import { buildRequestListColumns } from "./request-list-columns";

interface RequestListTableProps {
  data: BorrowRequest[] | undefined;
  loading: boolean;
  error: unknown;
  userLabel: (id: string) => string;
  onRowClick: (request: BorrowRequest) => void;
}

export function RequestListTable({ data, loading, error, userLabel, onRowClick }: RequestListTableProps) {
  const columns = buildRequestListColumns({ userLabel });

  return (
    <DataTable
      columns={columns}
      data={data}
      rowKey={(r) => r.id}
      onRowClick={onRowClick}
      loading={loading}
      error={error}
      empty={
        <EmptyState
          title="No borrow requests"
          description="Borrow requests will appear here for processing."
        />
      }
    />
  );
}
