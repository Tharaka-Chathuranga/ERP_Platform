import { PageHeader } from "@ui/layout/PageHeader";
import { useCan } from "@auth/useCan";
import { OILMART_SALE_CREATE } from "@auth/permissions";
import { useOilMartSales } from "./hooks/use-oil-mart-sales";
import { OilMartSalesToolbar } from "./oil-mart-sales-toolbar";
import { OilMartSalesBoard } from "./oil-mart-sales-board";

export function OilMartSalesPage() {
  const can = useCan();
  const canCreate = can(OILMART_SALE_CREATE);

  const {
    query,
    sales,
    clientsQuery,
    clientId,
    setClientId,
    dateRange,
    setDateRange,
    showTerminal,
    setShowTerminal,
    awaitingApproval,
    openNew,
    openDetail,
  } = useOilMartSales();

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height:
          "calc(100vh - var(--app-shell-header-height, 0px) - var(--mantine-spacing-lg))",
      }}
    >
      <div style={{ flexShrink: 0 }}>
        <PageHeader title="Sales Board" />

        <OilMartSalesToolbar
          clients={clientsQuery.data ?? []}
          clientId={clientId}
          onClientChange={setClientId}
          dateRange={dateRange}
          onDateRangeChange={setDateRange}
          showTerminal={showTerminal}
          onShowTerminalChange={setShowTerminal}
          awaitingApproval={awaitingApproval}
          canCreate={canCreate}
          onNew={openNew}
        />
      </div>

      <OilMartSalesBoard
        sales={sales}
        loading={query.isLoading}
        error={query.error}
        showTerminal={showTerminal}
        onSelect={openDetail}
      />
    </div>
  );
}
