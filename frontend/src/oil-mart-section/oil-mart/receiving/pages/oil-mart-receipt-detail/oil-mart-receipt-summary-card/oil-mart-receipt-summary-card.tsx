import { Card, Group, Stack, Text, Title } from "@mantine/core";
import dayjs from "dayjs";
import { DefinitionList } from "@ui/data";
import type { OilMartReceipt } from "@core/types";
import { MoneyText } from "../../../../components/money-text";

export function OilMartReceiptSummaryCard({ receipt }: { receipt: OilMartReceipt }) {
  const litres = receipt.lines.reduce((sum, line) => sum + line.quantityLitres, 0);

  return (
    <Card withBorder radius="md" padding="lg" mb="lg">
      <Group justify="space-between" align="flex-start" mb="lg" wrap="nowrap">
        <Stack gap={4}>
          <Title order={3}>{receipt.receiptNo}</Title>
          <Text size="sm" c="dimmed">
            {receipt.supplierName}
          </Text>
        </Stack>
        <Stack gap={2} align="flex-end">
          <Text size="xs" c="dimmed" tt="uppercase" fw={600}>
            Total cost
          </Text>
          <MoneyText value={receipt.totalCost} fz={28} fw={700} />
        </Stack>
      </Group>

      <DefinitionList
        items={[
          { label: "Supplier reference", value: receipt.referenceNo },
          { label: "Received at", value: dayjs(receipt.receivedAt).format("MMM D, YYYY h:mm A") },
          { label: "Lines", value: receipt.lines.length },
          { label: "Total litres", value: `${litres.toLocaleString()} L` },
          { label: "Note", value: receipt.note },
        ]}
      />
    </Card>
  );
}
