import { Card, Group, Textarea } from "@mantine/core";
import { DateInput } from "@mantine/dates";
import type { OilMartClient } from "@core/types";
import { ClientPicker } from "../../../../components/client-picker";

interface QuotationHeaderFieldsProps {
  clients: OilMartClient[];
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
  showErrors?: boolean;
}

export function QuotationHeaderFields({
  clients,
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
  showErrors,
}: QuotationHeaderFieldsProps) {
  return (
    <Card withBorder radius="md" padding="lg" mb="lg">
      <Group grow align="flex-start" mb="md">
        <ClientPicker
          label="Client"
          withAsterisk
          placeholder="Select or type a new client"
          clients={clients}
          value={clientId}
          onChange={onClientChange}
          onQuickAdd={onQuickAddClient}
          quickAddPending={quickAddPending}
          error={showErrors && !clientId ? "Select a client" : undefined}
        />
        <DateInput
          label="Issued date"
          withAsterisk
          value={issuedDate}
          onChange={onIssuedDateChange}
          valueFormat="MMM D, YYYY"
          error={showErrors && !issuedDate ? "Select the issued date" : undefined}
        />
        <DateInput
          label="Valid until"
          withAsterisk
          value={validUntil}
          onChange={onValidUntilChange}
          minDate={minValidUntil}
          valueFormat="MMM D, YYYY"
          description="At least one month from the issued date"
          error={
            showErrors && !validUntil
              ? "Select a valid-until date"
              : validityTooShort
                ? "Must be at least one month after the issued date"
                : undefined
          }
        />
      </Group>
      <Textarea
        label="Note"
        description="Printed on the client PDF."
        autosize
        minRows={2}
        value={note}
        onChange={(event) => onNoteChange(event.currentTarget.value)}
      />
    </Card>
  );
}
