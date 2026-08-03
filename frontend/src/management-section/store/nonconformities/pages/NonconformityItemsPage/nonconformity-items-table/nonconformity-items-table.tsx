import { Text } from "@mantine/core";
import { DataTable } from "@ui/data";
import type { NonconformityItemRow } from "@core/types";
import { buildNonconformityItemsColumns } from "./nonconformity-items-columns";

interface NonconformityItemsTableProps {
  data: NonconformityItemRow[];
  loading: boolean;
  error: unknown;
  itemLabel: (id: string) => string;
}

export function NonconformityItemsTable({ data, loading, error, itemLabel }: NonconformityItemsTableProps) {
  return (
    <DataTable<NonconformityItemRow>
      data={data}
      loading={loading}
      error={error}
      rowKey={(r) => `${r.reportId}:${r.itemId}`}
      empty={<Text c="dimmed" p="md">No nonconforming items.</Text>}
      columns={buildNonconformityItemsColumns({ itemLabel })}
    />
  );
}
