import { Card, Group, Stack, Text } from "@mantine/core";
import { IconAlertTriangle } from "@tabler/icons-react";
import dayjs from "dayjs";
import type { OilMartSale } from "@core/types";
import { MoneyText } from "../../../../components/money-text";

export function SaleCard({ sale, onClick }: { sale: OilMartSale; onClick: () => void }) {
  const overridden = sale.lines.some((line) => line.isPriceOverride);
  const expiringSoon =
    sale.status === "QUOTATION" &&
    sale.validUntil !== undefined &&
    dayjs(sale.validUntil).diff(dayjs(), "day") <= 3;

  return (
    <Card
      withBorder
      radius="md"
      padding="sm"
      onClick={onClick}
      style={{ cursor: "pointer" }}
    >
      <Group justify="space-between" wrap="nowrap" mb={6}>
        <Text fw={700} size="sm">
          {sale.saleNo}
        </Text>
        <MoneyText value={sale.total} emphasis />
      </Group>

      <Text size="sm" c="dimmed" lineClamp={1} mb={8}>
        {sale.clientName}
      </Text>

      <Group justify="space-between" wrap="nowrap">
        <Text size="xs" c="dimmed">
          {sale.lines.length} line{sale.lines.length === 1 ? "" : "s"} ·{" "}
          {dayjs(sale.quotedAt).format("MMM D")}
        </Text>
        <Stack gap={2} align="flex-end">
          {overridden && (
            <Group gap={2} wrap="nowrap">
              <IconAlertTriangle size={12} color="var(--mantine-color-orange-6)" />
              <Text size="xs" c="orange">
                Override
              </Text>
            </Group>
          )}
          {expiringSoon && (
            <Text size="xs" c="red" fw={600}>
              Expires {dayjs(sale.validUntil).format("MMM D")}
            </Text>
          )}
        </Stack>
      </Group>
    </Card>
  );
}
