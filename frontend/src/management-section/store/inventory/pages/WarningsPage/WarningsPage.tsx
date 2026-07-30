import { PageHeader } from "@ui/layout/PageHeader";
import { useWarnings } from "./hooks/use-warnings";
import { WarningsToolbar } from "./warnings-toolbar";
import { WarningsTable } from "./warnings-table";

export function WarningsPage() {
  const { search, setSearch, isLoading, error, rows } = useWarnings();

  return (
    <div>
      <PageHeader title="Stock warnings" />
      <WarningsToolbar search={search} onSearchChange={setSearch} />
      <WarningsTable data={rows} loading={isLoading} error={error} />
    </div>
  );
}
