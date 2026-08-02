import { Badge, Card, Group, ScrollArea, Stack, Text } from "@mantine/core";
import type { OilMartSale, OilMartSaleStatus } from "@core/types";
import { OIL_MART_SALE_STATUS_META } from "../../../components/oil-mart-sale-meta";
import { SaleCard } from "./sale-card";

interface StageColumnProps {
  status: OilMartSaleStatus;
  sales: OilMartSale[];
  onSelect: (sale: OilMartSale) => void;
}

export function StageColumn({ status, sales, onSelect }: StageColumnProps) {
  const meta = OIL_MART_SALE_STATUS_META[status];

  return (
    <Card
      withBorder
      radius="md"
      padding="sm"
      style={{
        backgroundColor: meta.bg,
        borderColor: meta.border,
        minWidth: 260,
        flex: 1,
        height: "100%",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <Group justify="space-between" mb="sm" wrap="nowrap" style={{ flexShrink: 0 }}>
        <Group gap={6} wrap="nowrap">
          <Text fw={700} size="sm">
            {meta.label}
          </Text>
        </Group>
        <Badge color={meta.badge} variant="filled" radius="sm" size="sm">
          {sales.length}
        </Badge>
      </Group>

      <ScrollArea type="auto" offsetScrollbars style={{ flex: 1, minHeight: 0 }}>
        <Stack gap="sm">
          {sales.length === 0 ? (
            <Text size="xs" c="dimmed" ta="center" py="lg">
              Nothing here
            </Text>
          ) : (
            sales.map((sale) => (
              <SaleCard key={sale.id} sale={sale} onClick={() => onSelect(sale)} />
            ))
          )}
        </Stack>
      </ScrollArea>
    </Card>
  );
}
