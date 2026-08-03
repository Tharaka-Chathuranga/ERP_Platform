import { Badge, Button, Card, Group, ScrollArea, Stack, Text } from "@mantine/core";
import { IconPlus } from "@tabler/icons-react";
import type { OilMartQuotation, OilMartQuotationStatus } from "@core/types";
import { OIL_MART_QUOTATION_STATUS_META } from "../../../components";
import { QuotationCard, type QuotationCardActions } from "./quotation-card";

interface StageColumnProps extends QuotationCardActions {
  status: OilMartQuotationStatus;
  quotations: OilMartQuotation[];
  onSelect: (quotation: OilMartQuotation) => void;
  onStartQuotation?: () => void;
  busy?: boolean;
}

export function StageColumn({
  status,
  quotations,
  onSelect,
  onStartQuotation,
  busy,
  ...actions
}: StageColumnProps) {
  const meta = OIL_MART_QUOTATION_STATUS_META[status];

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
          {quotations.length}
        </Badge>
      </Group>

      <ScrollArea type="auto" offsetScrollbars style={{ flex: 1, minHeight: 0 }}>
        <Stack gap="sm">
          {quotations.length === 0 ? (
            <Stack gap="xs" align="center" py="lg">
              <Text size="xs" c="dimmed" ta="center">
                {status === "DRAFT" ? "No quotations started yet" : "Nothing here"}
              </Text>
              {status === "DRAFT" && onStartQuotation && (
                <Button
                  size="compact-sm"
                  variant="light"
                  leftSection={<IconPlus size={14} />}
                  onClick={onStartQuotation}
                >
                  New quotation
                </Button>
              )}
            </Stack>
          ) : (
            quotations.map((quotation) => (
              <QuotationCard
                key={quotation.id}
                quotation={quotation}
                onClick={() => onSelect(quotation)}
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
