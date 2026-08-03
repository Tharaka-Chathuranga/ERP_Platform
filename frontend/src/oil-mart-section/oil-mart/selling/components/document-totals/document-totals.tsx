import { Divider, Group, Stack, Text } from "@mantine/core";
import { MoneyText } from "../../../components/money-text";

interface DocumentTotalsProps {
  subtotal: number;
  gstRatePercent: number;
  /** Gross amount, when the caller may see margin. */
  totalProfit?: number;
  gstAmount?: number;
  grandTotal?: number;
}

export function DocumentTotals({
  subtotal,
  gstRatePercent,
  totalProfit,
  gstAmount,
  grandTotal,
}: DocumentTotalsProps) {
  const gst = gstAmount ?? (subtotal * gstRatePercent) / 100;
  const total = grandTotal ?? subtotal + gst;
  const margin = totalProfit !== undefined && subtotal > 0 ? (totalProfit / subtotal) * 100 : undefined;

  return (
    <>
      <Divider my="lg" />

      <Stack gap="xs" align="flex-end">
        <Group gap="xl">
          <Text size="sm" c="dimmed">
            Subtotal
          </Text>
          <MoneyText value={subtotal} />
        </Group>

        <Group gap="xl">
          <Text size="sm" c="dimmed">
            GST ({gstRatePercent}%)
          </Text>
          <MoneyText value={gst} />
        </Group>

        <Group gap="xl" align="baseline">
          <Text size="sm" fw={600}>
            Grand total
          </Text>
          <MoneyText value={total} fz={24} fw={700} />
        </Group>

        {totalProfit !== undefined && (
          <Group gap="xl" align="baseline" mt="xs">
            <Text size="sm" c="dimmed">
              Total profit{margin !== undefined ? ` (${margin.toFixed(1)}%)` : ""}
            </Text>
            <MoneyText value={totalProfit} fw={600} c={totalProfit < 0 ? "red" : "teal"} />
          </Group>
        )}
      </Stack>
    </>
  );
}
