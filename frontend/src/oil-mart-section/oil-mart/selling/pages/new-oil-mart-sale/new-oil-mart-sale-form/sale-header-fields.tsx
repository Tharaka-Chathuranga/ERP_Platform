import { Card, Group, Textarea } from "@mantine/core";
import { DateInput, DateTimePicker } from "@mantine/dates";
import type { OilMartClient } from "@core/types";
import { ClientPicker } from "../../../../components/client-picker";

interface SaleHeaderFieldsProps {
  clients: OilMartClient[];
  clientId: string | null;
  onClientChange: (value: string | null) => void;
  quotedAt: Date | null;
  onQuotedAtChange: (value: Date | null) => void;
  validUntil: Date | null;
  onValidUntilChange: (value: Date | null) => void;
  note: string;
  onNoteChange: (value: string) => void;
  showErrors?: boolean;
}

export function SaleHeaderFields({
  clients,
  clientId,
  onClientChange,
  quotedAt,
  onQuotedAtChange,
  validUntil,
  onValidUntilChange,
  note,
  onNoteChange,
  showErrors,
}: SaleHeaderFieldsProps) {
  return (
    <Card withBorder radius="md" padding="lg" mb="lg">
      <Group grow align="flex-start" mb="md">
        <ClientPicker
          label="Client"
          withAsterisk
          placeholder="Select client"
          clients={clients}
          value={clientId}
          onChange={onClientChange}
          error={showErrors && !clientId ? "Select a client" : undefined}
        />
        <DateTimePicker
          label="Quoted at"
          withAsterisk
          value={quotedAt}
          onChange={onQuotedAtChange}
          valueFormat="MMM D, YYYY h:mm A"
          error={showErrors && !quotedAt ? "Select the quotation date" : undefined}
        />
        <DateInput
          label="Valid until"
          value={validUntil}
          onChange={onValidUntilChange}
          valueFormat="MMM D, YYYY"
          clearable
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
