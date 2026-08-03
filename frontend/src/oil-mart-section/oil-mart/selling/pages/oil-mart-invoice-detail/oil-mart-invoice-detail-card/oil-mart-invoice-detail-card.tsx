import {
  Anchor,
  Badge,
  Card,
  Divider,
  Group,
  SimpleGrid,
  Stack,
  Text,
  ThemeIcon,
  Title,
} from "@mantine/core";
import { Link } from "react-router-dom";
import dayjs from "dayjs";
import { DefinitionList } from "@ui/data";
import type { OilMartInvoice } from "@core/types";
import {
  OIL_MART_INVOICE_STATUS_META,
  DocumentLinesTable,
  DocumentTotals,
} from "../../../components";
import { MoneyText } from "../../../../components/money-text";
import { formatQuantity } from "../../../../components/quantity-text";

function Stat({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <Stack gap={2}>
      <Text size="xs" c="dimmed" tt="uppercase" fw={600}>
        {label}
      </Text>
      <Text component="div" fw={700} fz={20} lh={1.2}>
        {value}
      </Text>
    </Stack>
  );
}

export function OilMartInvoiceDetailCard({ invoice }: { invoice: OilMartInvoice }) {
  const meta = OIL_MART_INVOICE_STATUS_META[invoice.status];

  return (
    <Card
      withBorder
      radius="md"
      padding="lg"
      mb="lg"
      style={{ borderColor: meta.border, borderTopWidth: 3 }}
    >
      <Group justify="space-between" align="flex-start" wrap="nowrap" mb="lg">
        <Group gap="md" wrap="nowrap">
          <ThemeIcon color={meta.iconColor} variant="light" size={56} radius="md">
            {meta.icon}
          </ThemeIcon>
          <Stack gap={4}>
            <Title order={3}>{invoice.invoiceNo}</Title>
            <Group gap="xs">
              <Text size="sm" c="dimmed">
                {invoice.clientName}
              </Text>
              <Badge color={meta.badge} variant="light" radius="sm">
                {meta.label}
              </Badge>
            </Group>
          </Stack>
        </Group>
        <Stack gap={2} align="flex-end">
          <Text size="xs" c="dimmed" tt="uppercase" fw={600}>
            Grand total
          </Text>
          <MoneyText value={invoice.grandTotal} fz={30} fw={700} />
        </Stack>
      </Group>

      <SimpleGrid cols={{ base: 2, sm: 4 }} mb="lg">
        <Stat label="Lines" value={invoice.lines.length} />
        <Stat
          label="Total quantity"
          value={formatQuantity(
            invoice.lines.reduce((sum, line) => sum + line.quantityLitres, 0),
          )}
        />
        <Stat label="Invoice date" value={dayjs(invoice.invoiceDate).format("MMM D, YYYY")} />
        <Stat
          label="Quotation"
          value={
            <Anchor component={Link} to={`/oil-mart/quotations/${invoice.quotationId}`} fz={20}>
              {invoice.quotationNo}
            </Anchor>
          }
        />
      </SimpleGrid>

      {invoice.note && (
        <DefinitionList cols={{ base: 1 }} items={[{ label: "Note", value: invoice.note }]} />
      )}

      <Divider my="lg" />

      <DocumentLinesTable lines={invoice.lines} showProfit />

      <DocumentTotals
        subtotal={invoice.subtotal}
        gstRatePercent={invoice.gstRatePercent}
        gstAmount={invoice.gstAmount}
        grandTotal={invoice.grandTotal}
        totalProfit={invoice.totalProfit}
      />
    </Card>
  );
}
