import { useNavigate } from "react-router-dom";
import { PageHeader } from "@ui/layout/PageHeader";
import { useIssueList } from "./hooks/use-issue-list";
import { IssueListToolbar } from "./issue-list-toolbar";
import { IssueListTable } from "./issue-list-table";

export function IssueListPage() {
  const navigate = useNavigate();
  const {
    filter,
    setFilter,
    search,
    setSearch,
    selected,
    setSelected,
    query,
    userById,
    nameOf,
    rows,
    term,
  } = useIssueList();

  return (
    <div>
      <PageHeader title="Goods Issue" />

      <IssueListToolbar
        filter={filter}
        onFilterChange={setFilter}
        search={search}
        onSearchChange={setSearch}
        onCreate={() => navigate("/issuing/new")}
      />

      <IssueListTable
        data={rows}
        loading={query.isLoading}
        error={query.error}
        userById={userById}
        nameOf={nameOf}
        selected={selected}
        onSelectionChange={setSelected}
        onRowClick={(i) => navigate(`/issuing/${i.id}`)}
        searching={!!term}
      />
    </div>
  );
}
