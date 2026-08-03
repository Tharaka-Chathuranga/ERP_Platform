import { useNavigate } from "react-router-dom";
import { PageHeader } from "@ui/layout/PageHeader";
import { useRequestList } from "./hooks/use-request-list";
import { RequestListToolbar } from "./request-list-toolbar";
import { RequestListTable } from "./request-list-table";
import { NewBorrowRequestModal } from "../../components/NewBorrowRequestModal";

export function RequestListPage() {
  const navigate = useNavigate();
  const { filter, setFilter, newOpen, setNewOpen, query, userLabel } = useRequestList();

  return (
    <div>
      <PageHeader title="Borrow Requests" />

      <RequestListToolbar filter={filter} onFilterChange={setFilter} onCreate={() => setNewOpen(true)} />

      <RequestListTable
        data={query.data}
        loading={query.isLoading}
        error={query.error}
        userLabel={userLabel}
        onRowClick={(r) => navigate(`/requests/${r.id}`)}
      />

      <NewBorrowRequestModal opened={newOpen} onClose={() => setNewOpen(false)} />
    </div>
  );
}
