import { Text } from "@mantine/core";
import { DataTable, TableToolbar } from "@ui/data";
import type { NonconformityReport } from "@core/types";
import { STAGE_OPTIONS, STATUS_OPTIONS } from "./filter-options";
import { buildNonconformityColumns } from "./columns";

interface NonconformityReviewTableProps {
  rows: NonconformityReport[];
  isLoading: boolean;
  error: unknown;
  search: string;
  setSearch: (value: string) => void;
  stageFilter: string;
  setStageFilter: (value: string) => void;
  statusFilter: string;
  setStatusFilter: (value: string) => void;
  userLabel: (id: string) => string;
  onRowClick: (report: NonconformityReport) => void;
}

export function NonconformityReviewTable({
  rows,
  isLoading,
  error,
  search,
  setSearch,
  stageFilter,
  setStageFilter,
  statusFilter,
  setStatusFilter,
  userLabel,
  onRowClick,
}: NonconformityReviewTableProps) {
  const columns = buildNonconformityColumns(userLabel);

  return (
    <>
      <TableToolbar
        filters={[
          { label: "Status", value: statusFilter, onChange: setStatusFilter, options: STATUS_OPTIONS },
          { label: "Stage", value: stageFilter, onChange: setStageFilter, options: STAGE_OPTIONS },
        ]}
        search={{ value: search, onChange: setSearch, placeholder: "Search reporter or description…" }}
      />

      <DataTable<NonconformityReport>
        data={rows}
        loading={isLoading}
        error={error}
        rowKey={(d) => d.id}
        onRowClick={onRowClick}
        empty={
          <Text c="dimmed" p="md">
            No nonconformity reports match this filter.
          </Text>
        }
        columns={columns}
      />
    </>
  );
}
