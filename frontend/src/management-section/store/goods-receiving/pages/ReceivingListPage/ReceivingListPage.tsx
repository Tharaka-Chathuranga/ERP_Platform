import { useNavigate } from "react-router-dom";
import { PageHeader } from "@ui/layout/PageHeader";
import { useReceivingList } from "./hooks/use-receiving-list";
import { ReceivingListToolbar } from "./receiving-list-toolbar";
import { ReceivingListTable } from "./receiving-list-table";

export function ReceivingListPage() {
  const navigate = useNavigate();
  const { search, setSearch, isLoading, error, supplierName, rows } = useReceivingList();

  return (
    <div>
      <PageHeader title="Receiving" />

      <ReceivingListToolbar
        search={search}
        onSearchChange={setSearch}
        onCreate={() => navigate("/receiving/new")}
      />

      <ReceivingListTable
        data={rows}
        loading={isLoading}
        error={error}
        supplierName={supplierName}
        onRowClick={(r) => navigate(`/receiving/${r.id}`)}
        onCreate={() => navigate("/receiving/new")}
      />
    </div>
  );
}
