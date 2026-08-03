import { Badge, Card, Divider, Group, SimpleGrid, Stack, Text, ThemeIcon, Title } from "@mantine/core";
import dayjs from "dayjs";
import { DefinitionList } from "@ui/data";
import type { OilMartQuotation } from "@core/types";
import { OIL_MART_QUOTATION_STATUS_META, DocumentTotals } from "../../../components";
import { MoneyText } from "../../../../components/money-text";
import { Stat } from "./stat";
import { QuotationLines } from "./quotation-lines";

export function OilMartQuotationDetailCard({ quotation }: { quotation: OilMartQuotation }) {
  const meta = OIL_MART_QUOTATION_STATUS_META[quotation.status];

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
            <Title order={3}>{quotation.quotationNo}</Title>
            <Group gap="xs">
              <Text size="sm" c="dimmed">
                {quotation.clientName}
              </Text>
              <Badge color={meta.badge} variant="light" radius="sm">
                {meta.label}
              </Badge>
              {quotation.expired && (
                <Badge color="orange" variant="light" radius="sm">
                  Expired
                </Badge>
              )}
            </Group>
          </Stack>
        </Group>
        <Stack gap={2} align="flex-end">
          <Text size="xs" c="dimmed" tt="uppercase" fw={600}>
            Grand total
          </Text>
          <MoneyText value={quotation.grandTotal} fz={30} fw={700} />
        </Stack>
      </Group>

      <SimpleGrid cols={{ base: 2, sm: 4 }} mb="lg">
        <Stat label="Lines" value={quotation.lines.length} />
        <Stat
          label="Litres"
          value={`${quotation.lines
            .reduce((sum, line) => sum + line.quantityLitres, 0)
            .toLocaleString()} L`}
        />
        <Stat label="Issued" value={dayjs(quotation.issuedDate).format("MMM D, YYYY")} />
        <Stat label="Valid until" value={dayjs(quotation.validUntil).format("MMM D, YYYY")} />
      </SimpleGrid>

      <DefinitionList
        cols={{ base: 2, sm: 3 }}
        items={[
          {
            label: "Sent for approval",
            value: quotation.submittedAt
              ? dayjs(quotation.submittedAt).format("MMM D, YYYY h:mm A")
              : null,
          },
          {
            label: "Approved at",
            value: quotation.approvedAt
              ? dayjs(quotation.approvedAt).format("MMM D, YYYY h:mm A")
              : null,
          },
          {
            label: "Rejected at",
            value: quotation.rejectedAt
              ? dayjs(quotation.rejectedAt).format("MMM D, YYYY h:mm A")
              : null,
          },
          { label: "Rejection reason", value: quotation.rejectionReason },
          { label: "Cancellation reason", value: quotation.cancellationReason },
          { label: "Note", value: quotation.note },
        ]}
      />

      <Divider my="lg" />

      <QuotationLines quotation={quotation} />

      <DocumentTotals
        subtotal={quotation.subtotal}
        gstRatePercent={quotation.gstRatePercent}
        gstAmount={quotation.gstAmount}
        grandTotal={quotation.grandTotal}
        totalProfit={quotation.totalProfit}
      />
    </Card>
  );
}
