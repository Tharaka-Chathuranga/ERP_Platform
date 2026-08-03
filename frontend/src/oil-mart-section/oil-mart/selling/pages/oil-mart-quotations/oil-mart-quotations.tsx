import { PageHeader } from "@ui/layout/PageHeader";
import { useCan } from "@auth/useCan";
import { OILMART_SALE_APPROVE, OILMART_SALE_CREATE } from "@auth/permissions";
import { ApproveDocumentModal } from "../../components/approve-document-modal";
import { RejectDocumentModal } from "../../components/reject-document-modal";
import { useOilMartQuotations } from "./hooks/use-oil-mart-quotations";
import { OilMartQuotationsToolbar } from "./oil-mart-quotations-toolbar";
import { OilMartQuotationsBoard } from "./oil-mart-quotations-board";

export function OilMartQuotationsPage() {
  const can = useCan();
  const canCreate = can(OILMART_SALE_CREATE);
  const canApprove = can(OILMART_SALE_APPROVE);

  const {
    query,
    quotations,
    clientsQuery,
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
    submit,
    approve,
    reject,
    openNew,
    openDetail,
  } = useOilMartQuotations();

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
        <PageHeader title="Quotations" />

        <OilMartQuotationsToolbar
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

      <OilMartQuotationsBoard
        quotations={quotations}
        loading={query.isLoading}
        error={query.error}
        showTerminal={showTerminal}
        busy={busy}
        onSelect={openDetail}
        onStartQuotation={canCreate ? openNew : undefined}
        onSubmitForApproval={canCreate ? (quotation) => submit.mutate(quotation) : undefined}
        onApprove={
          canApprove ? (quotation) => setPending({ quotation, action: "approve" }) : undefined
        }
        onReject={
          canApprove ? (quotation) => setPending({ quotation, action: "reject" }) : undefined
        }
        onEdit={canCreate ? openDetail : undefined}
      />

      <ApproveDocumentModal
        opened={pending?.action === "approve"}
        quotation={pending?.quotation}
        submitting={approve.isPending}
        onClose={closePending}
        onSubmit={() => approve.mutate()}
      />

      <RejectDocumentModal
        opened={pending?.action === "reject"}
        documentNo={pending?.quotation.quotationNo}
        submitting={reject.isPending}
        onClose={closePending}
        onSubmit={(reason) => reject.mutate(reason)}
      />
    </div>
  );
}
