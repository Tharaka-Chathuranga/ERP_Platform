import {
  Alert,
  Box,
  Button,
  Card,
  Divider,
  Grid,
  Group,
  LoadingOverlay,
  Textarea,
} from "@mantine/core";
import { DateInput } from "@mantine/dates";
import { IconChevronRight, IconInfoCircle } from "@tabler/icons-react";
import { StepHeading } from "@ui/layout/StepHeading";
import type { OilMartClient, OilMartItem, OilMartStockBalance } from "@core/types";
import { ClientPicker } from "../../../../components/client-picker";
import { QuotationLineEditor, type QuotationLineDraft } from "../../../components";

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
    <Card withBorder radius="md" padding={0} pos="relative">
      <LoadingOverlay
        visible={submitting}
        overlayProps={{ blur: 1 }}
        loaderProps={{ children: editing ? "Saving quotation…" : "Creating quotation…" }}
      />

      <Box p="xl">
        <StepHeading number={1} title="Who is this quotation for?" />
        <Grid>
          <Grid.Col span={{ base: 12, sm: 6 }}>
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
          </Grid.Col>
          <Grid.Col span={{ base: 12, sm: 3 }}>
            <DateInput
              label="Issued date"
              withAsterisk
              value={issuedDate}
              onChange={onIssuedDateChange}
              valueFormat="MMM D, YYYY"
              error={showErrors && !issuedDate ? "Select the issued date" : undefined}
            />
          </Grid.Col>
          <Grid.Col span={{ base: 12, sm: 3 }}>
            <DateInput
              label="Valid until"
              withAsterisk
              value={validUntil}
              onChange={onValidUntilChange}
              minDate={minValidUntil}
              valueFormat="MMM D, YYYY"
              description="At least one month out"
              error={
                showErrors && !validUntil
                  ? "Select a valid-until date"
                  : validityTooShort
                    ? "Must be at least one month after the issued date"
                    : undefined
              }
            />
          </Grid.Col>
        </Grid>
      </Box>

      <Divider />
      <Box p="xl">
        <StepHeading number={2} title="What are they buying?" />
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
      </Box>

      <Divider />
      <Box p="xl">
        <StepHeading number={3} title="Anything the client should see?" />
        <Textarea
          label="Note"
          description="Printed on the client PDF."
          autosize
          minRows={2}
          value={note}
          onChange={(event) => onNoteChange(event.currentTarget.value)}
        />

        <Alert color="blue" variant="light" icon={<IconInfoCircle size={18} />} mt="lg">
          {resubmits
            ? "Saving sends this straight back to the manager for approval."
            : "Quantities are checked against stock on hand. Stock is only deducted later, when an invoice is approved."}
        </Alert>
      </Box>

      <Box p="xl" pt={0}>
        <Group justify="space-between">
          <Button variant="default" onClick={onCancel} disabled={submitting}>
            Cancel
          </Button>
          <Button
            radius="md"
            rightSection={<IconChevronRight size={16} />}
            onClick={onSubmit}
            loading={submitting}
          >
            {resubmits ? "Save & resubmit" : editing ? "Save changes" : "Create quotation"}
          </Button>
        </Group>
      </Box>
    </Card>
  );
}
