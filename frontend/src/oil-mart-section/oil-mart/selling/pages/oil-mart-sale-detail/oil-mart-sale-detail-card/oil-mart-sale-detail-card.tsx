import { Badge, Card, Divider, Group, SimpleGrid, Stack, Text, ThemeIcon, Title } from "@mantine/core";
import dayjs from "dayjs";
import { DefinitionList } from "@ui/data";
import type { OilMartSale } from "@core/types";
import {
  OIL_MART_SALE_STATUS_META,
  PAYMENT_METHOD_LABELS,
} from "../../../components/oil-mart-sale-meta";
import { MoneyText } from "../../../../components/money-text";
import { Stat } from "./stat";
import { SaleLines } from "./sale-lines";

export function OilMartSaleDetailCard({ sale }: { sale: OilMartSale }) {
  const meta = OIL_MART_SALE_STATUS_META[sale.status];

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
            <Title order={3}>{sale.saleNo}</Title>
            <Group gap="xs">
              <Text size="sm" c="dimmed">
                {sale.clientName}
              </Text>
              <Badge color={meta.badge} variant="light" radius="sm">
                {meta.label}
              </Badge>
            </Group>
          </Stack>
        </Group>
        <Stack gap={2} align="flex-end">
          <Text size="xs" c="dimmed" tt="uppercase" fw={600}>
            Total
          </Text>
          <MoneyText value={sale.total} fz={30} fw={700} />
        </Stack>
      </Group>

      <SimpleGrid cols={{ base: 2, sm: 4 }} mb="lg">
        <Stat label="Lines" value={sale.lines.length} />
        <Stat
          label="Litres"
          value={`${sale.lines.reduce((sum, line) => sum + line.quantityLitres, 0).toLocaleString()} L`}
        />
        <Stat label="Quoted" value={dayjs(sale.quotedAt).format("MMM D, YYYY")} />
        <Stat
          label="Valid until"
          value={sale.validUntil ? dayjs(sale.validUntil).format("MMM D, YYYY") : "—"}
        />
      </SimpleGrid>

      <DefinitionList
        cols={{ base: 2, sm: 3 }}
        items={[
          {
            label: "Ordered at",
            value: sale.orderedAt ? dayjs(sale.orderedAt).format("MMM D, YYYY h:mm A") : null,
          },
          {
            label: "Approved at",
            value: sale.approvedAt ? dayjs(sale.approvedAt).format("MMM D, YYYY h:mm A") : null,
          },
          {
            label: "Dispatched at",
            value: sale.dispatchedAt ? dayjs(sale.dispatchedAt).format("MMM D, YYYY h:mm A") : null,
          },
          { label: "Vehicle", value: sale.vehicleNo },
          { label: "Driver", value: sale.driverName },
          { label: "Invoice", value: sale.invoiceNo },
          {
            label: "Invoiced at",
            value: sale.invoicedAt ? dayjs(sale.invoicedAt).format("MMM D, YYYY h:mm A") : null,
          },
          {
            label: "Payment method",
            value: sale.paymentMethod ? PAYMENT_METHOD_LABELS[sale.paymentMethod] : null,
          },
          { label: "Note", value: sale.note },
        ]}
      />

      <Divider my="lg" />

      <SaleLines sale={sale} />
    </Card>
  );
}
