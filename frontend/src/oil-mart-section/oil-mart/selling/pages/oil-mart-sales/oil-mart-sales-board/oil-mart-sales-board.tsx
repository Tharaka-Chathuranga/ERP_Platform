import { Group, ScrollArea, Stack, Text } from "@mantine/core";
import { QueryBoundary } from "@ui/feedback/QueryBoundary";
import { EmptyState } from "@ui/feedback/EmptyState";
import type { OilMartSale } from "@core/types";
import {
  OIL_MART_BOARD_STATUSES,
  OIL_MART_TERMINAL_STATUSES,
} from "../../../components/oil-mart-sale-meta";
import { StageColumn } from "./stage-column";

interface OilMartSalesBoardProps {
  sales: OilMartSale[];
  loading?: boolean;
  error?: unknown;
  showTerminal?: boolean;
  onSelect: (sale: OilMartSale) => void;
}

export function OilMartSalesBoard({
  sales,
  loading,
  error,
  showTerminal,
  onSelect,
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
          description="Raise a quotation to start the selling flow."
        />
      }
    >
      <ScrollArea type="auto" offsetScrollbars>
        <Group align="stretch" gap="md" wrap="nowrap">
          {OIL_MART_BOARD_STATUSES.map((status) => (
            <StageColumn
              key={status}
              status={status}
              sales={sales.filter((sale) => sale.status === status)}
              onSelect={onSelect}
            />
          ))}
        </Group>
      </ScrollArea>

      {showTerminal && terminal.length > 0 && (
        <Stack gap="sm" mt="lg">
          <Text size="xs" c="dimmed" tt="uppercase" fw={700}>
            Rejected & cancelled
          </Text>
          <Group align="stretch" gap="md" wrap="nowrap">
            {OIL_MART_TERMINAL_STATUSES.map((status) => (
              <StageColumn
                key={status}
                status={status}
                sales={terminal.filter((sale) => sale.status === status)}
                onSelect={onSelect}
              />
            ))}
          </Group>
        </Stack>
      )}
    </QueryBoundary>
  );
}
