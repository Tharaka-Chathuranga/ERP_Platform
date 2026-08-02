import { Badge, Button, Card, Group, ScrollArea, Stack, Text } from "@mantine/core";
import { IconPlus } from "@tabler/icons-react";
import type { OilMartSale, OilMartSaleStatus } from "@core/types";
import { OIL_MART_SALE_STATUS_META } from "../../../components/oil-mart-sale-meta";
import { SaleCard, type SaleCardActions } from "./sale-card";

interface StageColumnProps extends SaleCardActions {
  status: OilMartSaleStatus;
  sales: OilMartSale[];
  onSelect: (sale: OilMartSale) => void;
  onStartSale?: () => void;
  busy?: boolean;
}

export function StageColumn({
  status,
  sales,
  onSelect,
  onStartSale,
  busy,
  ...actions
}: StageColumnProps) {
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
            <Stack gap="xs" align="center" py="lg">
              <Text size="xs" c="dimmed" ta="center">
                {status === "QUOTATION" ? "No sales started yet" : "Nothing here"}
              </Text>
              {status === "QUOTATION" && onStartSale && (
                <Button
                  size="compact-sm"
                  variant="light"
                  leftSection={<IconPlus size={14} />}
                  onClick={onStartSale}
                >
                  Start a sale
                </Button>
              )}
            </Stack>
          ) : (
            sales.map((sale) => (
              <SaleCard
                key={sale.id}
                sale={sale}
                onClick={() => onSelect(sale)}
                busy={busy}
                {...actions}
              />
            ))
          )}
        </Stack>
      </ScrollArea>
    </Card>
  );
}
