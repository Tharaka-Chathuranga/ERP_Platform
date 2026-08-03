import { Alert, Card, Group, Radio, Stack, Text } from "@mantine/core";
import { IconAlertTriangle } from "@tabler/icons-react";
import dayjs from "dayjs";
import type { OilMartQuotation } from "@core/types";
import { EmptyState } from "@ui/feedback/EmptyState";
import { MoneyText } from "../../../components/money-text";

interface QuotationPickerProps {
  quotations: OilMartQuotation[];
  value: string | null;
  onChange: (quotationId: string) => void;
  error?: string;
}

export function QuotationPicker({ quotations, value, onChange, error }: QuotationPickerProps) {
  const selected = quotations.find((quotation) => quotation.id === value);

  if (quotations.length === 0) {
    return (
      <Card withBorder radius="md" padding="lg">
        <EmptyState
          title="No quotations ready to invoice"
          description="A quotation must be approved, still valid and not already invoiced."
        />
      </Card>
    );
  }

  return (
    <Card withBorder radius="md" padding="lg">
      <Text fw={600} mb="xs">
        Which quotation is this invoice for?
      </Text>
      <Text size="xs" c="dimmed" mb="md">
        The invoice copies the lines, totals and GST from the quotation you pick.
      </Text>

      <Radio.Group value={value} onChange={onChange} error={error}>
        <Stack gap="xs">
          {quotations.map((quotation) => (
            <Card
              key={quotation.id}
              withBorder
              radius="sm"
              padding="sm"
              style={{
                cursor: "pointer",
                borderColor:
                  quotation.id === value ? "var(--mantine-color-blue-5)" : undefined,
              }}
              onClick={() => onChange(quotation.id)}
            >
              <Group justify="space-between" wrap="nowrap" align="flex-start">
                <Group gap="sm" wrap="nowrap" align="flex-start">
                  <Radio value={quotation.id} aria-label={quotation.quotationNo} />
                  <Stack gap={2}>
                    <Text fw={600} size="sm">
                      {quotation.quotationNo}
                    </Text>
                    <Text size="xs" c="dimmed">
                      {quotation.clientName} · {quotation.lines.length} line
                      {quotation.lines.length === 1 ? "" : "s"}
                    </Text>
                    <Text size="xs" c={quotation.expired ? "red" : "dimmed"}>
                      {quotation.expired ? "Expired " : "Valid until "}
                      {dayjs(quotation.validUntil).format("MMM D, YYYY")}
                    </Text>
                  </Stack>
                </Group>
                <MoneyText value={quotation.grandTotal} emphasis />
              </Group>
            </Card>
          ))}
        </Stack>
      </Radio.Group>

      {selected?.expired && (
        <Alert color="red" variant="light" icon={<IconAlertTriangle size={18} />} mt="md">
          This quotation is not valid now — it needs to be edited with current data before it can
          be invoiced.
        </Alert>
      )}
    </Card>
  );
}
