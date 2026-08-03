import {
  Anchor,
  Badge,
  Card,
  Divider,
  Group,
  SimpleGrid,
  Stack,
  Table,
  Text,
  ThemeIcon,
  Title,
} from "@mantine/core";
import { Link } from "react-router-dom";
import dayjs from "dayjs";
import { DefinitionList } from "@ui/data";
import type { OilMartInvoice } from "@core/types";
import { OIL_MART_INVOICE_STATUS_META, DocumentTotals } from "../../../components";
import { MoneyText } from "../../../../components/money-text";

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
  const showProfit = invoice.lines.some((line) => line.lineProfit !== undefined);

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
          label="Litres"
          value={`${invoice.lines
            .reduce((sum, line) => sum + line.quantityLitres, 0)
            .toLocaleString()} L`}
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

      <DefinitionList
        cols={{ base: 2, sm: 3 }}
        items={[
          {
            label: "Approved at",
            value: invoice.approvedAt
              ? dayjs(invoice.approvedAt).format("MMM D, YYYY h:mm A")
              : null,
          },
          {
            label: "Rejected at",
            value: invoice.rejectedAt
              ? dayjs(invoice.rejectedAt).format("MMM D, YYYY h:mm A")
              : null,
          },
          { label: "Rejection reason", value: invoice.rejectionReason },
          { label: "Cancellation reason", value: invoice.cancellationReason },
          { label: "Bank", value: invoice.bankDetails?.bankName },
          { label: "Account", value: invoice.bankDetails?.accountNumber },
          { label: "Note", value: invoice.note },
        ]}
      />

      <Divider my="lg" />

      <Table.ScrollContainer minWidth={showProfit ? 900 : 760}>
        <Table verticalSpacing="sm" striped>
          <Table.Thead>
            <Table.Tr>
              <Table.Th>Oil</Table.Th>
              <Table.Th style={{ textAlign: "right" }}>Quantity</Table.Th>
              <Table.Th style={{ textAlign: "right" }}>Unit price</Table.Th>
              <Table.Th style={{ textAlign: "right" }}>Discount</Table.Th>
              <Table.Th style={{ textAlign: "right" }}>Line total</Table.Th>
              {showProfit && <Table.Th style={{ textAlign: "right" }}>Profit</Table.Th>}
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {invoice.lines.map((line) => (
              <Table.Tr key={line.id}>
                <Table.Td>
                  <Text size="sm" fw={500}>
                    {line.itemName}
                  </Text>
                  <Text size="xs" c="dimmed">
                    {line.itemCode}
                    {line.isPriceOverride ? " · price overridden" : ""}
                  </Text>
                </Table.Td>
                <Table.Td style={{ textAlign: "right" }}>
                  {line.quantityLitres.toLocaleString()} L
                </Table.Td>
                <Table.Td style={{ textAlign: "right" }}>
                  <MoneyText value={line.unitPrice} />
                </Table.Td>
                <Table.Td style={{ textAlign: "right" }}>
                  {line.discountPercent ? `${line.discountPercent}%` : "—"}
                </Table.Td>
                <Table.Td style={{ textAlign: "right" }}>
                  <MoneyText value={line.lineTotal} emphasis />
                </Table.Td>
                {showProfit && (
                  <Table.Td style={{ textAlign: "right" }}>
                    <MoneyText
                      value={line.lineProfit}
                      c={(line.lineProfit ?? 0) < 0 ? "red" : "teal"}
                    />
                  </Table.Td>
                )}
              </Table.Tr>
            ))}
          </Table.Tbody>
        </Table>
      </Table.ScrollContainer>

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
