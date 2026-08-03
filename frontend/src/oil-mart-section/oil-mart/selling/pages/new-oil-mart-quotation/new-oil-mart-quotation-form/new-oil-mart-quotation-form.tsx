import { Alert, Button, Group } from "@mantine/core";
import { IconInfoCircle } from "@tabler/icons-react";
import type { OilMartClient, OilMartItem, OilMartStockBalance } from "@core/types";
import { QuotationLineEditor, type QuotationLineDraft } from "../../../components";
import { QuotationHeaderFields } from "./quotation-header-fields";

interface NewOilMartQuotationFormProps {
  clients: OilMartClient[];
  items: OilMartItem[];
  stock: OilMartStockBalance[];
  gstRatePercent: number;
  showProfit?: boolean;
  editing?: boolean;
  resubmits?: boolean;
  clientId: string | null;
  onClientChange: (value: string | null) => void;
  onQuickAddClient?: (name: string) => void;
  quickAddPending?: boolean;
  issuedDate: Date | null;
  onIssuedDateChange: (value: Date | null) => void;
  validUntil: Date | null;
  onValidUntilChange: (value: Date | null) => void;
  minValidUntil: Date;
  validityTooShort?: boolean;
  note: string;
  onNoteChange: (value: string) => void;
  lines: QuotationLineDraft[];
  onLineChange: (key: string, patch: Partial<QuotationLineDraft>) => void;
  onAddLine: () => void;
  onRemoveLine: (key: string) => void;
  showErrors: boolean;
  submitting: boolean;
  onSubmit: () => void;
  onCancel: () => void;
}

export function NewOilMartQuotationForm({
  clients,
  items,
  stock,
  gstRatePercent,
  showProfit,
  editing,
  resubmits,
  clientId,
  onClientChange,
  onQuickAddClient,
  quickAddPending,
  issuedDate,
  onIssuedDateChange,
  validUntil,
  onValidUntilChange,
  minValidUntil,
  validityTooShort,
  note,
  onNoteChange,
  lines,
  onLineChange,
  onAddLine,
  onRemoveLine,
  showErrors,
  submitting,
  onSubmit,
  onCancel,
}: NewOilMartQuotationFormProps) {
  const linesInvalid = lines.some(
    (line) => !line.itemId || !(line.quantityLitres ?? 0) || !(line.unitPrice ?? 0),
  );

  return (
    <div>
      <QuotationHeaderFields
        clients={clients}
        clientId={clientId}
        onClientChange={onClientChange}
        onQuickAddClient={onQuickAddClient}
        quickAddPending={quickAddPending}
        issuedDate={issuedDate}
        onIssuedDateChange={onIssuedDateChange}
        validUntil={validUntil}
        onValidUntilChange={onValidUntilChange}
        minValidUntil={minValidUntil}
        validityTooShort={validityTooShort}
        note={note}
        onNoteChange={onNoteChange}
        showErrors={showErrors}
      />

      <QuotationLineEditor
        lines={lines}
        items={items}
        stock={stock}
        gstRatePercent={gstRatePercent}
        showProfit={showProfit}
        error={
          showErrors && linesInvalid
            ? "Every line needs an oil, a quantity and a price"
            : undefined
        }
        onChange={onLineChange}
        onAdd={onAddLine}
        onRemove={onRemoveLine}
      />

      <Alert color="blue" variant="light" icon={<IconInfoCircle size={18} />} mt="lg">
        {resubmits
          ? "Saving sends this straight back to the manager for approval."
          : "Quantities are checked against stock on hand. Stock is only deducted later, when an invoice is approved."}
      </Alert>

      <Group justify="flex-end" mt="lg">
        <Button variant="default" onClick={onCancel} disabled={submitting}>
          Cancel
        </Button>
        <Button onClick={onSubmit} loading={submitting}>
          {resubmits ? "Save & resubmit" : editing ? "Save changes" : "Raise quotation"}
        </Button>
      </Group>
    </div>
  );
}
