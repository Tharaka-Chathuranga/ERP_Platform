import { Card, Group, Stack, Text, Title } from "@mantine/core";
import { AreaChart } from "@mantine/charts";
import dayjs from "dayjs";
import type { OilMartOverview } from "@core/types";
import { PAYMENT_METHOD_LABELS } from "../../../../selling/components/oil-mart-sale-meta";
import { MoneyText } from "../../../../components/money-text";

export function OilMartSalesTrendChart({ overview }: { overview: OilMartOverview }) {
  const data = overview.salesTrend.map((point) => ({
    date: dayjs(point.date).format("MMM D"),
    total: point.total,
  }));

  return (
    <Card withBorder radius="md" padding="lg" mb="lg">
      <Group justify="space-between" align="flex-start" mb="lg" wrap="wrap">
        <Title order={4}>Sales trend</Title>
        <Group gap="xl">
          {overview.revenueByMethod.map((entry) => (
            <Stack key={entry.paymentMethod} gap={2} align="flex-end">
              <Text size="xs" c="dimmed" tt="uppercase" fw={600}>
                {PAYMENT_METHOD_LABELS[entry.paymentMethod]}
              </Text>
              <MoneyText value={entry.total} emphasis />
            </Stack>
          ))}
        </Group>
      </Group>

      <AreaChart
        h={220}
        data={data}
        dataKey="date"
        series={[{ name: "total", color: "teal.6", label: "Sales" }]}
        curveType="monotone"
        withGradient
        withDots={false}
        valueFormatter={(value) => `Rs ${value.toLocaleString()}`}
      />
    </Card>
  );
}
