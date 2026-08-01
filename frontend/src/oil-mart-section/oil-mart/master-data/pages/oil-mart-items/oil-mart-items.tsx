import { useQuery } from "@tanstack/react-query";
import { PageHeader } from "@ui/layout/PageHeader";
import { useCan } from "@auth/useCan";
import { OILMART_ITEM_MANAGE } from "@auth/permissions";
import { qk } from "@core/queryKeys";
import { listOilMartStock } from "../../../stock/api";
import { ItemFormModal } from "../../components/item-form-modal";
import { useOilMartItems } from "./hooks/use-oil-mart-items";
import { OilMartItemsToolbar } from "./oil-mart-items-toolbar";
import { OilMartItemsTable } from "./oil-mart-items-table";

export function OilMartItemsPage() {
  const can = useCan();
  const canManage = can(OILMART_ITEM_MANAGE);

  const {
    query,
    items,
    search,
    setSearch,
    oilType,
    setOilType,
    status,
    setStatus,
    formOpen,
    editing,
    openCreate,
    closeForm,
    save,
    openDetail,
  } = useOilMartItems();

  const stockQuery = useQuery({ queryKey: qk.oilMartStock(), queryFn: listOilMartStock });

  return (
    <div>
      <PageHeader title="Oils" />

      <OilMartItemsToolbar
        search={search}
        onSearchChange={setSearch}
        oilType={oilType}
        onOilTypeChange={setOilType}
        status={status}
        onStatusChange={setStatus}
        canManage={canManage}
        onAdd={openCreate}
      />

      <OilMartItemsTable
        data={items}
        stock={stockQuery.data}
        loading={query.isLoading}
        error={query.error}
        onRowClick={openDetail}
      />

      <ItemFormModal
        opened={formOpen}
        item={editing}
        submitting={save.isPending}
        onClose={closeForm}
        onSubmit={(values) => save.mutate(values)}
      />
    </div>
  );
}
