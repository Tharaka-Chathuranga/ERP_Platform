import { PageHeader } from "@ui/layout/PageHeader";
import { useCan } from "@auth/useCan";
import { OILMART_SALE_APPROVE, OILMART_SALE_CREATE } from "@auth/permissions";
import { ApproveSaleModal } from "../../components/approve-sale-modal";
import { DispatchModal } from "../../components/dispatch-modal";
import { InvoiceModal } from "../../components/invoice-modal";
import { RejectSaleModal } from "../../components/reject-sale-modal";
import { useOilMartSales } from "./hooks/use-oil-mart-sales";
import { OilMartSalesToolbar } from "./oil-mart-sales-toolbar";
import { OilMartSalesBoard } from "./oil-mart-sales-board";

export function OilMartSalesPage() {
  const can = useCan();
  const canCreate = can(OILMART_SALE_CREATE);
  const canApprove = can(OILMART_SALE_APPROVE);

  const {
    query,
    sales,
    clientsQuery,
    stockQuery,
    clientId,
    setClientId,
    dateRange,
    setDateRange,
    showTerminal,
    setShowTerminal,
    awaitingApproval,
    pending,
    setPending,
    closePending,
    busy,
    submitForApproval,
    approveQuotation,
    rejectQuotation,
    approve,
    reject,
    dispatch,
    invoice,
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
        busy={busy}
        onSelect={openDetail}
        onStartSale={canCreate ? openNew : undefined}
        onSubmitForApproval={canCreate ? (sale) => submitForApproval.mutate(sale) : undefined}
        onApproveQuotation={
          canApprove ? (sale) => setPending({ sale, action: "approveQuotation" }) : undefined
        }
        onRejectQuotation={
          canApprove ? (sale) => setPending({ sale, action: "rejectQuotation" }) : undefined
        }
        onApprove={canApprove ? (sale) => setPending({ sale, action: "approve" }) : undefined}
        onReject={canApprove ? (sale) => setPending({ sale, action: "reject" }) : undefined}
        onDispatch={canCreate ? (sale) => setPending({ sale, action: "dispatch" }) : undefined}
        onInvoice={canCreate ? (sale) => setPending({ sale, action: "invoice" }) : undefined}
      />

      <ApproveSaleModal
        opened={pending?.action === "approveQuotation"}
        sale={pending?.sale}
        title="Approve quotation"
        description="Approving raises a sales order and allocates its order number."
        confirmLabel="Approve quotation"
        submitting={approveQuotation.isPending}
        onClose={closePending}
        onSubmit={() => approveQuotation.mutate()}
      />

      <RejectSaleModal
        opened={pending?.action === "rejectQuotation"}
        saleNo={pending?.sale.saleNo}
        submitting={rejectQuotation.isPending}
        onClose={closePending}
        onSubmit={(reason) => rejectQuotation.mutate(reason)}
      />

      <ApproveSaleModal
        opened={pending?.action === "approve"}
        sale={pending?.sale}
        submitting={approve.isPending}
        onClose={closePending}
        onSubmit={() => approve.mutate()}
      />

      <RejectSaleModal
        opened={pending?.action === "reject"}
        saleNo={pending?.sale.saleNo}
        submitting={reject.isPending}
        onClose={closePending}
        onSubmit={(reason) => reject.mutate(reason)}
      />

      <DispatchModal
        opened={pending?.action === "dispatch"}
        sale={pending?.sale}
        stock={stockQuery.data}
        submitting={dispatch.isPending}
        onClose={closePending}
        onSubmit={(values) => dispatch.mutate(values)}
      />

      <InvoiceModal
        opened={pending?.action === "invoice"}
        sale={pending?.sale}
        submitting={invoice.isPending}
        onClose={closePending}
        onSubmit={(paymentMethod) => invoice.mutate(paymentMethod)}
      />
    </div>
  );
}
