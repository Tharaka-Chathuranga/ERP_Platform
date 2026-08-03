import { PageHeader } from "@ui/layout/PageHeader";
import { useNonconformityItems } from "./hooks/use-nonconformity-items";
import { NonconformityItemsToolbar } from "./nonconformity-items-toolbar";
import { NonconformityItemsTable } from "./nonconformity-items-table";

export function NonconformityItemsPage() {
  const { filter, setFilter, search, setSearch, query, itemLabel, filtered } = useNonconformityItems();

  return (
    <div>
      <PageHeader title="Nonconforming items" />
      <NonconformityItemsToolbar
        filter={filter}
        onFilterChange={setFilter}
        search={search}
        onSearchChange={setSearch}
      />

      <NonconformityItemsTable
        data={filtered}
        loading={query.isLoading}
        error={query.error}
        itemLabel={itemLabel}
      />
    </div>
  );
}
