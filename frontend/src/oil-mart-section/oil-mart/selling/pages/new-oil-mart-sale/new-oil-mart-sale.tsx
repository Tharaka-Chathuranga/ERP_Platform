import { PageHeader } from "@ui/layout/PageHeader";
import { useNewOilMartSale } from "./hooks/use-new-oil-mart-sale";
import { NewOilMartSaleForm } from "./new-oil-mart-sale-form";

export function NewOilMartSalePage() {
  const {
    clientId,
    setClientId,
    quotedAt,
    setQuotedAt,
    validUntil,
    setValidUntil,
    note,
    setNote,
    discountAmount,
    setDiscountAmount,
    lines,
    showErrors,
    itemsQuery,
    clientsQuery,
    stockQuery,
    create,
    submit,
    updateLine,
    addLine,
    removeLine,
    cancel,
  } = useNewOilMartSale();

  return (
    <div>
      <PageHeader title="New sale" />

      <NewOilMartSaleForm
        clients={clientsQuery.data ?? []}
        items={itemsQuery.data ?? []}
        stock={stockQuery.data ?? []}
        clientId={clientId}
        onClientChange={setClientId}
        quotedAt={quotedAt}
        onQuotedAtChange={setQuotedAt}
        validUntil={validUntil}
        onValidUntilChange={setValidUntil}
        note={note}
        onNoteChange={setNote}
        lines={lines}
        discountAmount={discountAmount}
        onDiscountAmountChange={setDiscountAmount}
        onLineChange={updateLine}
        onAddLine={addLine}
        onRemoveLine={removeLine}
        showErrors={showErrors}
        submitting={create.isPending}
        onSubmit={submit}
        onCancel={cancel}
      />
    </div>
  );
}
