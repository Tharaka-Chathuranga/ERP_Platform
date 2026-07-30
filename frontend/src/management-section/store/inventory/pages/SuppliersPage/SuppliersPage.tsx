import { Grid } from "@mantine/core";
import { PageHeader } from "@ui/layout/PageHeader";
import { useSuppliers } from "./hooks/use-suppliers";
import { SuppliersToolbar } from "./suppliers-toolbar";
import { SuppliersTable } from "./suppliers-table";
import { SupplierItemsPanel } from "./supplier-items-panel";
import { SupplierFormModal } from "../../components/SupplierFormModal";

export function SuppliersPage() {
  const {
    canManage,
    itemLabel,
    selected,
    setSelected,
    creating,
    setCreating,
    search,
    setSearch,
    suppliers,
    supplierItems,
    toggle,
    filteredSuppliers,
  } = useSuppliers();

  return (
    <div>
      <PageHeader title="Suppliers" />

      <SuppliersToolbar
        search={search}
        onSearchChange={setSearch}
        canManage={canManage}
        onCreate={() => setCreating(true)}
      />

      <Grid align="flex-start">
        <Grid.Col span={{ base: 12, md: 6 }}>
          <SuppliersTable
            data={filteredSuppliers}
            loading={suppliers.isLoading}
            error={suppliers.error}
            activeRowKey={selected?.id}
            onRowClick={setSelected}
            canManage={canManage}
            togglePending={toggle.isPending}
            onToggle={(s) => toggle.mutate(s)}
          />
        </Grid.Col>

        <Grid.Col span={{ base: 12, md: 6 }}>
          <SupplierItemsPanel
            selected={selected}
            data={supplierItems.data}
            loading={supplierItems.isLoading}
            error={supplierItems.error}
            itemLabel={itemLabel}
          />
        </Grid.Col>
      </Grid>

      <SupplierFormModal opened={creating} onClose={() => setCreating(false)} />
    </div>
  );
}
