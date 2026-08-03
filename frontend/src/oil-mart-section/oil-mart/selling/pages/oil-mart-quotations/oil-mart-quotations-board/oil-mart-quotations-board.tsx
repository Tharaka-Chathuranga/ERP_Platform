import { Box, Button, Group, Stack, Text } from "@mantine/core";
import { IconPlus } from "@tabler/icons-react";
import { QueryBoundary } from "@ui/feedback/QueryBoundary";
import { EmptyState } from "@ui/feedback/EmptyState";
import type { OilMartQuotation } from "@core/types";
import {
  OIL_MART_QUOTATION_BOARD_STATUSES,
  OIL_MART_QUOTATION_TERMINAL_STATUSES,
} from "../../../components";
import { StageColumn } from "./stage-column";
import type { QuotationCardActions } from "./quotation-card";

interface OilMartQuotationsBoardProps extends QuotationCardActions {
  quotations: OilMartQuotation[];
  loading?: boolean;
  error?: unknown;
  showTerminal?: boolean;
  busy?: boolean;
  onSelect: (quotation: OilMartQuotation) => void;
  onStartQuotation?: () => void;
}

export function OilMartQuotationsBoard({
  quotations,
  loading,
  error,
  showTerminal,
  busy,
  onSelect,
  onStartQuotation,
  ...actions
}: OilMartQuotationsBoardProps) {
  const terminal = quotations.filter((quotation) =>
    OIL_MART_QUOTATION_TERMINAL_STATUSES.includes(quotation.status),
  );

  return (
    <QueryBoundary
      loading={loading}
      error={error}
      isEmpty={quotations.length === 0}
      empty={
        <EmptyState
          title="No quotations"
          description="Every sale starts as a quotation. Raise one to begin."
          action={
            onStartQuotation ? (
              <Button leftSection={<IconPlus size={16} />} onClick={onStartQuotation}>
                New quotation
              </Button>
            ) : undefined
          }
        />
      }
    >
      <Stack gap="lg" style={{ flex: 1, minHeight: 0 }}>
        <Box style={{ flex: 2, minHeight: 0, overflowX: "auto", overflowY: "hidden" }}>
          <Group align="stretch" gap="md" wrap="nowrap" h="100%">
            {OIL_MART_QUOTATION_BOARD_STATUSES.map((status) => (
              <StageColumn
                key={status}
                status={status}
                quotations={quotations.filter((quotation) => quotation.status === status)}
                onSelect={onSelect}
                onStartQuotation={onStartQuotation}
                busy={busy}
                {...actions}
              />
            ))}
          </Group>
        </Box>

        {showTerminal && terminal.length > 0 && (
          <Stack gap="sm" style={{ flex: 1, minHeight: 0 }}>
            <Text size="xs" c="dimmed" tt="uppercase" fw={700}>
              Rejected &amp; cancelled
            </Text>
            <Box style={{ flex: 1, minHeight: 0, overflowX: "auto", overflowY: "hidden" }}>
              <Group align="stretch" gap="md" wrap="nowrap" h="100%">
                {OIL_MART_QUOTATION_TERMINAL_STATUSES.map((status) => (
                  <StageColumn
                    key={status}
                    status={status}
                    quotations={terminal.filter((quotation) => quotation.status === status)}
                    onSelect={onSelect}
                    {...actions}
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
