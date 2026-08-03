import { PageHeader } from "@ui/layout/PageHeader";
import { CountRequestModal } from "../../components/CountRequestModal";
import { useCountRequests } from "./hooks/use-count-requests";
import { CountRequestsToolbar } from "./count-requests-toolbar";
import { CountRequestsTable } from "./count-requests-table";

export function CountRequestsPage() {
  const {
    filter,
    setFilter,
    search,
    setSearch,
    creating,
    setCreating,
    isLoading,
    error,
    itemLabel,
    userLabel,
    canApprove,
    busy,
    filtered,
    onApprove,
    onReject,
  } = useCountRequests();

  return (
    <div>
      <PageHeader title="Count requests" />

      <CountRequestsToolbar
        filter={filter}
        onFilterChange={setFilter}
        search={search}
        onSearchChange={setSearch}
        onCreate={() => setCreating(true)}
      />

      <CountRequestsTable
        data={filtered}
        loading={isLoading}
        error={error}
        itemLabel={itemLabel}
        userLabel={userLabel}
        canApprove={canApprove}
        busy={busy}
        onApprove={onApprove}
        onReject={onReject}
      />

      <CountRequestModal opened={creating} onClose={() => setCreating(false)} />
    </div>
  );
}
