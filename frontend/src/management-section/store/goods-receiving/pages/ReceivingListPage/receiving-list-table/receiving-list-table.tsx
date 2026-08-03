import { Button } from "@mantine/core";
import { EmptyState } from "@ui/feedback/EmptyState";
import { DataTable } from "@ui/data/DataTable";
import type { Receival } from "@core/types";
import { buildReceivingListColumns } from "./receiving-list-columns";

interface ReceivingListTableProps {
  data: Receival[];
  loading: boolean;
  error: unknown;
  supplierName: (id?: string, name?: string) => string;
  onRowClick: (receival: Receival) => void;
  onCreate: () => void;
}

export function ReceivingListTable({
  data,
  loading,
  error,
  supplierName,
  onRowClick,
  onCreate,
}: ReceivingListTableProps) {
  const columns = buildReceivingListColumns({ supplierName });

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
          title="No receivals yet"
          description="Receive items into the store — stock is updated immediately and a GRN is generated automatically."
          action={
            <Button variant="light" onClick={onCreate}>
              New item receival
            </Button>
          }
        />
      }
    />
  );
}
