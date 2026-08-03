import { useNavigate } from "react-router-dom";
import { PageHeader } from "@ui/layout/PageHeader";
import { useItems } from "./hooks/use-items";
import { ItemsToolbar } from "./items-toolbar";
import { ItemsTable } from "./items-table";
import { CreateItemModal } from "../../components/CreateItemModal";

export function ItemsPage() {
  const navigate = useNavigate();
  const {
    search,
    setSearch,
    categoryFilter,
    setCategoryFilter,
    statusFilter,
    setStatusFilter,
    flagFilter,
    setFlagFilter,
    createOpen,
    setCreateOpen,
    canEdit,
    items,
    filteredItems,
    onHandMap,
    categoryOptions,
  } = useItems();

  return (
    <div>
      <PageHeader title="Store" />

      <ItemsToolbar
        search={search}
        onSearchChange={setSearch}
        categoryFilter={categoryFilter}
        onCategoryChange={setCategoryFilter}
        categoryOptions={categoryOptions}
        statusFilter={statusFilter}
        onStatusChange={setStatusFilter}
        flagFilter={flagFilter}
        onFlagChange={setFlagFilter}
        canEdit={canEdit}
        onCreate={() => setCreateOpen(true)}
      />

      <ItemsTable
        data={filteredItems}
        loading={items.isLoading}
        error={items.error}
        onHandMap={onHandMap}
        onRowClick={(i) => navigate(`/store/${i.id}`)}
      />

      <CreateItemModal opened={createOpen} onClose={() => setCreateOpen(false)} />
    </div>
  );
}
