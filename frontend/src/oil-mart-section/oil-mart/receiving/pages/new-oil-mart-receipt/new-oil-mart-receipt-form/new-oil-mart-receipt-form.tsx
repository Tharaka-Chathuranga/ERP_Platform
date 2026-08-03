import { Alert, Button, Group } from "@mantine/core";
import { IconAlertTriangle } from "@tabler/icons-react";
import type { OilMartItem, OilMartSupplier } from "@core/types";
import {
  ReceiptLineEditor,
  type ReceiptLineDraft,
} from "../../../components/receipt-line-editor";
import { ReceiptHeaderFields } from "./receipt-header-fields";

interface NewOilMartReceiptFormProps {
  suppliers: OilMartSupplier[];
  items: OilMartItem[];
  supplierId: string | null;
  onSupplierChange: (value: string | null) => void;
  referenceNo: string;
  onReferenceNoChange: (value: string) => void;
  receivedAt: Date | null;
  onReceivedAtChange: (value: Date | null) => void;
  note: string;
  onNoteChange: (value: string) => void;
  lines: ReceiptLineDraft[];
  onLineChange: (key: string, patch: Partial<ReceiptLineDraft>) => void;
  onAddLine: () => void;
  onRemoveLine: (key: string) => void;
  showErrors: boolean;
  submitting: boolean;
  onSubmit: () => void;
  onCancel: () => void;
}

export function NewOilMartReceiptForm({
  suppliers,
  items,
  supplierId,
  onSupplierChange,
  referenceNo,
  onReferenceNoChange,
  receivedAt,
  onReceivedAtChange,
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
}: NewOilMartReceiptFormProps) {
  const linesInvalid = lines.some(
    (line) => !line.itemId || !(line.quantityLitres ?? 0) || !(line.buyUnitPrice ?? 0),
  );

  return (
    <div>
      <ReceiptHeaderFields
        suppliers={suppliers}
        supplierId={supplierId}
        onSupplierChange={onSupplierChange}
        referenceNo={referenceNo}
        onReferenceNoChange={onReferenceNoChange}
        receivedAt={receivedAt}
        onReceivedAtChange={onReceivedAtChange}
        note={note}
        onNoteChange={onNoteChange}
        showErrors={showErrors}
      />

      <ReceiptLineEditor
        lines={lines}
        items={items}
        error={showErrors && linesInvalid ? "Every line needs an oil, a quantity and a buy price" : undefined}
        onChange={onLineChange}
        onAdd={onAddLine}
        onRemove={onRemoveLine}
      />

      <Alert
        color="yellow"
        variant="light"
        icon={<IconAlertTriangle size={18} />}
        mt="lg"
        title="Stock updates immediately"
      >
        Saving this receipt adds the quantities to oil mart stock straight away. There is no
        approval step and it cannot be reversed from this screen.
      </Alert>

      <Group justify="flex-end" mt="lg">
        <Button variant="default" onClick={onCancel} disabled={submitting}>
          Cancel
        </Button>
        <Button onClick={onSubmit} loading={submitting}>
          Record receipt
        </Button>
      </Group>
    </div>
  );
}
