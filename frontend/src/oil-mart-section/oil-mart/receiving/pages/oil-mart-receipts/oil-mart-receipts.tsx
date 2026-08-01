import { PageHeader } from "@ui/layout/PageHeader";
import { useCan } from "@auth/useCan";
import { OILMART_RECEIVE } from "@auth/permissions";
import { useOilMartReceipts } from "./hooks/use-oil-mart-receipts";
import { OilMartReceiptsToolbar } from "./oil-mart-receipts-toolbar";
import { OilMartReceiptsTable } from "./oil-mart-receipts-table";

export function OilMartReceiptsPage() {
  const can = useCan();
  const canReceive = can(OILMART_RECEIVE);

  const {
    query,
    receipts,
    suppliersQuery,
    supplierId,
    setSupplierId,
    dateRange,
    setDateRange,
    openNew,
    openDetail,
  } = useOilMartReceipts();

  return (
    <div>
      <PageHeader title="Oil receipts" />

      <OilMartReceiptsToolbar
        suppliers={suppliersQuery.data ?? []}
        supplierId={supplierId}
        onSupplierChange={setSupplierId}
        dateRange={dateRange}
        onDateRangeChange={setDateRange}
        canReceive={canReceive}
        onNew={openNew}
      />

      <OilMartReceiptsTable
        data={receipts}
        loading={query.isLoading}
        error={query.error}
        onRowClick={openDetail}
      />
    </div>
  );
}
