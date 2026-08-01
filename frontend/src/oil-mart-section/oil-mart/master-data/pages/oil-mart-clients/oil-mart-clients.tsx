import { PageHeader } from "@ui/layout/PageHeader";
import { useCan } from "@auth/useCan";
import { OILMART_CLIENT_MANAGE } from "@auth/permissions";
import { ClientFormModal } from "../../components/client-form-modal";
import { useOilMartClients } from "./hooks/use-oil-mart-clients";
import { OilMartClientsToolbar } from "./oil-mart-clients-toolbar";
import { OilMartClientsTable } from "./oil-mart-clients-table";

export function OilMartClientsPage() {
  const can = useCan();
  const canManage = can(OILMART_CLIENT_MANAGE);

  const {
    query,
    clients,
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
    openDetail,
  } = useOilMartClients();

  return (
    <div>
      <PageHeader title="Clients" />

      <OilMartClientsToolbar
        search={search}
        onSearchChange={setSearch}
        status={status}
        onStatusChange={setStatus}
        canManage={canManage}
        onAdd={openCreate}
      />

      <OilMartClientsTable
        data={clients}
        loading={query.isLoading}
        error={query.error}
        canManage={canManage}
        onEdit={openEdit}
        onRowClick={openDetail}
      />

      <ClientFormModal
        opened={formOpen}
        client={editing}
        submitting={save.isPending}
        onClose={closeForm}
        onSubmit={(values) => save.mutate(values)}
      />
    </div>
  );
}
