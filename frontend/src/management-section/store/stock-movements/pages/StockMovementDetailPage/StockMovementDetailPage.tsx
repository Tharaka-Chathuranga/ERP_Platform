import { PageHeader } from "@ui/layout/PageHeader";
import { useStockMovementDetail } from "./hooks/use-stock-movement-detail";
import { StockMovementDetailToolbar } from "./stock-movement-detail-toolbar";
import { StockMovementDetailTable } from "./stock-movement-detail-table";

export function StockMovementDetailPage() {
  const {
    itemCode,
    all,
    search,
    setSearch,
    typeFilter,
    setTypeFilter,
    itemFilter,
    setItemFilter,
    range,
    setRange,
    visible,
    typeOptions,
    itemOptions,
  } = useStockMovementDetail();

  return (
    <div>
      <PageHeader title="Movement detail" />

      <StockMovementDetailToolbar
        search={search}
        onSearchChange={setSearch}
        typeFilter={typeFilter}
        onTypeFilterChange={setTypeFilter}
        itemFilter={itemFilter}
        onItemFilterChange={setItemFilter}
        range={range}
        onRangeChange={setRange}
        typeOptions={typeOptions}
        itemOptions={itemOptions}
      />

      <StockMovementDetailTable
        data={visible}
        loading={all.isLoading}
        error={all.error}
        itemCode={itemCode}
      />
    </div>
  );
}
