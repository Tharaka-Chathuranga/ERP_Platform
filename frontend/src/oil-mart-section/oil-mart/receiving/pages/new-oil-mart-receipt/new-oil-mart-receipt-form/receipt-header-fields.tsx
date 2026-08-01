import { Card, Group, Select, Textarea, TextInput } from "@mantine/core";
import { DateTimePicker } from "@mantine/dates";
import type { OilMartSupplier } from "@core/types";

interface ReceiptHeaderFieldsProps {
  suppliers: OilMartSupplier[];
  supplierId: string | null;
  onSupplierChange: (value: string | null) => void;
  referenceNo: string;
  onReferenceNoChange: (value: string) => void;
  receivedAt: Date | null;
  onReceivedAtChange: (value: Date | null) => void;
  note: string;
  onNoteChange: (value: string) => void;
  showErrors?: boolean;
}

export function ReceiptHeaderFields({
  suppliers,
  supplierId,
  onSupplierChange,
  referenceNo,
  onReferenceNoChange,
  receivedAt,
  onReceivedAtChange,
  note,
  onNoteChange,
  showErrors,
}: ReceiptHeaderFieldsProps) {
  return (
    <Card withBorder radius="md" padding="lg" mb="lg">
      <Group grow align="flex-start" mb="md">
        <Select
          label="Supplier"
          withAsterisk
          searchable
          placeholder="Select supplier"
          data={suppliers
            .filter((supplier) => supplier.status === "ACTIVE")
            .map((supplier) => ({ value: supplier.id, label: `${supplier.code} — ${supplier.name}` }))}
          value={supplierId}
          onChange={onSupplierChange}
          error={showErrors && !supplierId ? "Select a supplier" : undefined}
        />
        <TextInput
          label="Supplier reference"
          placeholder="Invoice or delivery note number"
          value={referenceNo}
          onChange={(event) => onReferenceNoChange(event.currentTarget.value)}
        />
        <DateTimePicker
          label="Received at"
          withAsterisk
          value={receivedAt}
          onChange={onReceivedAtChange}
          valueFormat="MMM D, YYYY h:mm A"
          error={showErrors && !receivedAt ? "Select when the oil arrived" : undefined}
        />
      </Group>
      <Textarea
        label="Note"
        autosize
        minRows={2}
        value={note}
        onChange={(event) => onNoteChange(event.currentTarget.value)}
      />
    </Card>
  );
}
