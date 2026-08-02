import { Box, Button, Group, Stack, Text } from "@mantine/core";
import { IconPlus } from "@tabler/icons-react";
import { QueryBoundary } from "@ui/feedback/QueryBoundary";
import { EmptyState } from "@ui/feedback/EmptyState";
import type { OilMartSale } from "@core/types";
import {
  OIL_MART_BOARD_STATUSES,
  OIL_MART_TERMINAL_STATUSES,
} from "../../../components/oil-mart-sale-meta";
import { StageColumn } from "./stage-column";
import type { SaleCardActions } from "./sale-card";

interface OilMartSalesBoardProps extends SaleCardActions {
  sales: OilMartSale[];
  loading?: boolean;
  error?: unknown;
  showTerminal?: boolean;
  busy?: boolean;
  onSelect: (sale: OilMartSale) => void;
  onStartSale?: () => void;
}

export function OilMartSalesBoard({
  sales,
  loading,
  error,
  showTerminal,
  busy,
  onSelect,
  onStartSale,
  ...actions
}: OilMartSalesBoardProps) {
  const terminal = sales.filter((sale) => OIL_MART_TERMINAL_STATUSES.includes(sale.status));

  return (
    <QueryBoundary
      loading={loading}
      error={error}
      isEmpty={sales.length === 0}
      empty={
        <EmptyState
          title="No sales"
          description="Every sale starts as a quotation. Start one to begin the selling flow."
          action={
            onStartSale ? (
              <Button leftSection={<IconPlus size={16} />} onClick={onStartSale}>
                Start a sale
              </Button>
            ) : undefined
          }
        />
      }
    >
      <Stack gap="lg" style={{ flex: 1, minHeight: 0 }}>
        <Box style={{ flex: 2, minHeight: 0, overflowX: "auto", overflowY: "hidden" }}>
          <Group align="stretch" gap="md" wrap="nowrap" h="100%">
            {OIL_MART_BOARD_STATUSES.map((status) => (
              <StageColumn
                key={status}
                status={status}
                sales={sales.filter((sale) => sale.status === status)}
                onSelect={onSelect}
                onStartSale={onStartSale}
                busy={busy}
                {...actions}
              />
            ))}
          </Group>
        </Box>

        {showTerminal && terminal.length > 0 && (
          <Stack gap="sm" style={{ flex: 1, minHeight: 0 }}>
            <Text size="xs" c="dimmed" tt="uppercase" fw={700}>
              Rejected & cancelled
            </Text>
            <Box style={{ flex: 1, minHeight: 0, overflowX: "auto", overflowY: "hidden" }}>
              <Group align="stretch" gap="md" wrap="nowrap" h="100%">
                {OIL_MART_TERMINAL_STATUSES.map((status) => (
                  <StageColumn
                    key={status}
                    status={status}
                    sales={terminal.filter((sale) => sale.status === status)}
                    onSelect={onSelect}
                  />
                ))}
              </Group>
            </Box>
          </Stack>
        )}
      </Stack>
    </QueryBoundary>
  );
}
