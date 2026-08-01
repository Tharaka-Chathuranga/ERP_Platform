import { PageHeader } from "@ui/layout/PageHeader";
import { useNewOilMartReceipt } from "./hooks/use-new-oil-mart-receipt";
import { NewOilMartReceiptForm } from "./new-oil-mart-receipt-form";

export function NewOilMartReceiptPage() {
  const {
    supplierId,
    setSupplierId,
    referenceNo,
    setReferenceNo,
    receivedAt,
    setReceivedAt,
    note,
    setNote,
    lines,
    showErrors,
    itemsQuery,
    suppliersQuery,
    record,
    submit,
    updateLine,
    addLine,
    removeLine,
    cancel,
  } = useNewOilMartReceipt();

  return (
    <div>
      <PageHeader title="Record oil receipt" />

      <NewOilMartReceiptForm
        suppliers={suppliersQuery.data ?? []}
        items={itemsQuery.data ?? []}
        supplierId={supplierId}
        onSupplierChange={setSupplierId}
        referenceNo={referenceNo}
        onReferenceNoChange={setReferenceNo}
        receivedAt={receivedAt}
        onReceivedAtChange={setReceivedAt}
        note={note}
        onNoteChange={setNote}
        lines={lines}
        onLineChange={updateLine}
        onAddLine={addLine}
        onRemoveLine={removeLine}
        showErrors={showErrors}
        submitting={record.isPending}
        onSubmit={submit}
        onCancel={cancel}
      />
    </div>
  );
}
