import { EmptyState } from "@ui/feedback/EmptyState";
import { DataTable } from "@ui/data";
import type { Issue, UserSummary } from "@core/types";
import { buildIssueListColumns } from "./issue-list-columns";

interface IssueListTableProps {
  data: Issue[];
  loading: boolean;
  error: unknown;
  userById: Map<string, UserSummary>;
  nameOf: (id: string) => string;
  selected: Set<string>;
  onSelectionChange: (selected: Set<string>) => void;
  onRowClick: (issue: Issue) => void;
  searching: boolean;
}

export function IssueListTable({
  data,
  loading,
  error,
  userById,
  nameOf,
  selected,
  onSelectionChange,
  onRowClick,
  searching,
}: IssueListTableProps) {
  const columns = buildIssueListColumns({ userById, nameOf });

  return (
    <DataTable
      columns={columns}
      data={data}
      rowKey={(i) => i.id}
      onRowClick={onRowClick}
      loading={loading}
      error={error}
      selection={{ selected, onChange: onSelectionChange }}
      empty={
        <EmptyState
          title="No goods issues"
          description={searching ? "No issues match your search." : "Issue stock to a user to get started."}
        />
      }
    />
  );
}
