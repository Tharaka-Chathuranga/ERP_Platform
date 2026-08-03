import { Card, Group, Progress, Stack, Text, Title } from "@mantine/core";
import { StatusBadge } from "@ui/feedback/StatusBadge";
import { DefinitionList } from "@ui/data";
import type { OilMartItem, OilMartItemPrice, OilMartStockBalance } from "@core/types";
import { OilTypeBadge } from "../../../../components/oil-type-badge";
import { MoneyText } from "../../../../components/money-text";

interface OilMartItemSummaryCardProps {
  item: OilMartItem;
  balance?: OilMartStockBalance;
  currentPrice?: OilMartItemPrice;
}

export function OilMartItemSummaryCard({
  item,
  balance,
  currentPrice,
}: OilMartItemSummaryCardProps) {
  const onHand = balance?.quantityOnHand ?? 0;
  const reorder = item.reorderLevelLitres || 1;
  const ratio = Math.min((onHand / reorder) * 100, 100);
  const low = onHand < item.reorderLevelLitres;

  return (
    <Card withBorder radius="md" padding="lg" mb="lg">
      <Group justify="space-between" align="flex-start" mb="md" wrap="nowrap">
        <Stack gap={4}>
          <Title order={3}>{item.name}</Title>
          <Group gap="xs">
            <Text size="sm" c="dimmed">
              {item.code}
            </Text>
            <OilTypeBadge oilType={item.oilType} />
            <StatusBadge status={item.status} />
          </Group>
        </Stack>
        <Stack gap={2} align="flex-end">
          <Text size="xs" c="dimmed" tt="uppercase" fw={600}>
            On hand
          </Text>
          <Text fw={700} fz={28} lh={1.1} c={low ? "red" : undefined}>
            {onHand.toLocaleString()} L
          </Text>
        </Stack>
      </Group>

      <Progress value={ratio} color={low ? "red" : "teal"} radius="sm" mb="xs" />
      <Text size="xs" c="dimmed" mb="lg">
        Reorder level {item.reorderLevelLitres.toLocaleString()} L
      </Text>

      <DefinitionList
        items={[
          { label: "Brand", value: item.brand },
          { label: "Grade", value: item.grade },
          { label: "Buy price", value: <MoneyText value={currentPrice?.buyPrice} /> },
          { label: "Sell price", value: <MoneyText value={currentPrice?.sellPrice} emphasis /> },
          { label: "Stock value", value: <MoneyText value={balance?.stockValue} /> },
          { label: "Description", value: item.description },
        ]}
      />
    </Card>
  );
}
