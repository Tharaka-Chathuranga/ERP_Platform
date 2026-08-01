import { PageHeader } from "@ui/layout/PageHeader";
import { useCan } from "@auth/useCan";
import { OILMART_ITEM_MANAGE } from "@auth/permissions";
import { SupplierFormModal } from "../../components/supplier-form-modal";
import { useOilMartSuppliers } from "./hooks/use-oil-mart-suppliers";
import { OilMartSuppliersToolbar } from "./oil-mart-suppliers-toolbar";
import { OilMartSuppliersTable } from "./oil-mart-suppliers-table";

export function OilMartSuppliersPage() {
  const can = useCan();
  const canManage = can(OILMART_ITEM_MANAGE);

  const {
    query,
    suppliers,
    search,
    setSearch,
    status,
    setStatus,
    formOpen,
    editing,
    openCreate,
    openEdit,
    closeForm,
    save,
  } = useOilMartSuppliers();

  return (
    <div>
      <PageHeader title="Oil mart suppliers" />

      <OilMartSuppliersToolbar
        search={search}
        onSearchChange={setSearch}
        status={status}
        onStatusChange={setStatus}
        canManage={canManage}
        onAdd={openCreate}
      />

      <OilMartSuppliersTable
        data={suppliers}
        loading={query.isLoading}
        error={query.error}
        canManage={canManage}
        onEdit={openEdit}
      />

      <SupplierFormModal
        opened={formOpen}
        supplier={editing}
        submitting={save.isPending}
        onClose={closeForm}
        onSubmit={(values) => save.mutate(values)}
      />
    </div>
  );
}
