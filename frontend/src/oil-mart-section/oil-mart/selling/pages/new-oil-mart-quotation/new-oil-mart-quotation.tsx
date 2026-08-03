import { PageHeader } from "@ui/layout/PageHeader";
import { useNewOilMartQuotation } from "./hooks/use-new-oil-mart-quotation";
import { NewOilMartQuotationForm } from "./new-oil-mart-quotation-form";

export function NewOilMartQuotationPage() {
  const {
    editing,
    existing,
    showProfit,
    gstRatePercent,
    clientId,
    setClientId,
    issuedDate,
    setIssuedDate,
    validUntil,
    setValidUntil,
    minValidUntil,
    validityTooShort,
    note,
    setNote,
    lines,
    showErrors,
    itemsQuery,
    clientsQuery,
    stockQuery,
    quickAdd,
    save,
    submit,
    updateLine,
    addLine,
    removeLine,
    cancel,
  } = useNewOilMartQuotation();

  return (
    <div>
      <PageHeader
        title={editing ? `Edit ${existing?.quotationNo ?? "quotation"}` : "New quotation"}
      />

      <NewOilMartQuotationForm
        clients={clientsQuery.data ?? []}
        items={itemsQuery.data ?? []}
        stock={stockQuery.data ?? []}
        gstRatePercent={gstRatePercent}
        showProfit={showProfit}
        editing={editing}
        resubmits={existing?.status === "REJECTED"}
        clientId={clientId}
        onClientChange={setClientId}
        onQuickAddClient={(name) => quickAdd.mutate(name)}
        quickAddPending={quickAdd.isPending}
        issuedDate={issuedDate}
        onIssuedDateChange={setIssuedDate}
        validUntil={validUntil}
        onValidUntilChange={setValidUntil}
        minValidUntil={minValidUntil}
        validityTooShort={validityTooShort}
        note={note}
        onNoteChange={setNote}
        lines={lines}
        onLineChange={updateLine}
        onAddLine={addLine}
        onRemoveLine={removeLine}
        showErrors={showErrors}
        submitting={save.isPending}
        onSubmit={submit}
        onCancel={cancel}
      />
    </div>
  );
}
