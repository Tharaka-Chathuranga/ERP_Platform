import { Alert, Button, Group } from "@mantine/core";
import { IconInfoCircle } from "@tabler/icons-react";
import type { OilMartClient, OilMartItem, OilMartStockBalance } from "@core/types";
import { SaleLineEditor, type SaleLineDraft } from "../../../components/sale-line-editor";
import { SaleHeaderFields } from "./sale-header-fields";

interface NewOilMartSaleFormProps {
  clients: OilMartClient[];
  items: OilMartItem[];
  stock: OilMartStockBalance[];
  clientId: string | null;
  onClientChange: (value: string | null) => void;
  quotedAt: Date | null;
  onQuotedAtChange: (value: Date | null) => void;
  validUntil: Date | null;
  onValidUntilChange: (value: Date | null) => void;
  note: string;
  onNoteChange: (value: string) => void;
  lines: SaleLineDraft[];
  discountAmount: number;
  onDiscountAmountChange: (value: number) => void;
  onLineChange: (key: string, patch: Partial<SaleLineDraft>) => void;
  onAddLine: () => void;
  onRemoveLine: (key: string) => void;
  showErrors: boolean;
  submitting: boolean;
  onSubmit: () => void;
  onCancel: () => void;
}

export function NewOilMartSaleForm({
  clients,
  items,
  stock,
  clientId,
  onClientChange,
  quotedAt,
  onQuotedAtChange,
  validUntil,
  onValidUntilChange,
  note,
  onNoteChange,
  lines,
  discountAmount,
  onDiscountAmountChange,
  onLineChange,
  onAddLine,
  onRemoveLine,
  showErrors,
  submitting,
  onSubmit,
  onCancel,
}: NewOilMartSaleFormProps) {
  const linesInvalid = lines.some(
    (line) => !line.itemId || !(line.quantityLitres ?? 0) || !(line.unitPrice ?? 0),
  );

  return (
    <div>
      <SaleHeaderFields
        clients={clients}
        clientId={clientId}
        onClientChange={onClientChange}
        quotedAt={quotedAt}
        onQuotedAtChange={onQuotedAtChange}
        validUntil={validUntil}
        onValidUntilChange={onValidUntilChange}
        note={note}
        onNoteChange={onNoteChange}
        showErrors={showErrors}
      />

      <SaleLineEditor
        lines={lines}
        items={items}
        stock={stock}
        discountAmount={discountAmount}
        error={showErrors && linesInvalid ? "Every line needs an oil, a quantity and a price" : undefined}
        onChange={onLineChange}
        onAdd={onAddLine}
        onRemove={onRemoveLine}
        onDiscountAmountChange={onDiscountAmountChange}
      />

      <Alert color="blue" variant="light" icon={<IconInfoCircle size={18} />} mt="lg">
        This is raised as a quotation. Stock is only deducted later, when an approved order is
        dispatched.
      </Alert>

      <Group justify="flex-end" mt="lg">
        <Button variant="default" onClick={onCancel} disabled={submitting}>
          Cancel
        </Button>
        <Button onClick={onSubmit} loading={submitting}>
          Raise quotation
        </Button>
      </Group>
    </div>
  );
}
