import type { MouseEvent } from "react";
import { Button, Card, Group, Stack, Text } from "@mantine/core";
import { IconAlertTriangle, IconCircleCheck, IconPencil, IconSend, IconX } from "@tabler/icons-react";
import dayjs from "dayjs";
import type { OilMartQuotation } from "@core/types";
import { MoneyText } from "../../../../components/money-text";

export interface QuotationCardActions {
  onSubmitForApproval?: (quotation: OilMartQuotation) => void;
  onApprove?: (quotation: OilMartQuotation) => void;
  onReject?: (quotation: OilMartQuotation) => void;
  onEdit?: (quotation: OilMartQuotation) => void;
}

interface QuotationCardProps extends QuotationCardActions {
  quotation: OilMartQuotation;
  onClick: () => void;
  busy?: boolean;
}

export function QuotationCard({
  quotation,
  onClick,
  busy,
  onSubmitForApproval,
  onApprove,
  onReject,
  onEdit,
}: QuotationCardProps) {
  const overridden = quotation.lines.some((line) => line.isPriceOverride);
  const expiringSoon =
    !quotation.expired &&
    quotation.status !== "CANCELLED" &&
    dayjs(quotation.validUntil).diff(dayjs(), "day") <= 3;

  const stop = (run: () => void) => (event: MouseEvent) => {
    event.stopPropagation();
    run();
  };

  return (
    <Card withBorder radius="md" padding="sm" onClick={onClick} style={{ cursor: "pointer" }}>
      <Group justify="space-between" wrap="nowrap" mb={6}>
        <Text fw={700} size="sm">
          {quotation.quotationNo}
        </Text>
        <MoneyText value={quotation.grandTotal} emphasis />
      </Group>

      <Text size="sm" c="dimmed" lineClamp={1} mb={8}>
        {quotation.clientName}
      </Text>

      <Group justify="space-between" wrap="nowrap" align="flex-start">
        <Text size="xs" c="dimmed">
          {quotation.lines.length} line{quotation.lines.length === 1 ? "" : "s"} ·{" "}
          {dayjs(quotation.issuedDate).format("MMM D")}
        </Text>
        <Stack gap={2} align="flex-end">
          {quotation.totalProfit !== undefined && (
            <Text size="xs" c={quotation.totalProfit < 0 ? "red" : "teal"} fw={600}>
              {quotation.totalProfit < 0 ? "Loss" : "Profit"}{" "}
              <MoneyText value={quotation.totalProfit} size="xs" c="inherit" />
            </Text>
          )}
          {overridden && (
            <Group gap={2} wrap="nowrap">
              <IconAlertTriangle size={12} color="var(--mantine-color-orange-6)" />
              <Text size="xs" c="orange">
                Override
              </Text>
            </Group>
          )}
          {quotation.expired ? (
            <Text size="xs" c="red" fw={600}>
              Expired {dayjs(quotation.validUntil).format("MMM D")}
            </Text>
          ) : (
            expiringSoon && (
              <Text size="xs" c="orange" fw={600}>
                Expires {dayjs(quotation.validUntil).format("MMM D")}
              </Text>
            )
          )}
        </Stack>
      </Group>

      {quotation.rejectionReason && quotation.status === "REJECTED" && (
        <Text size="xs" c="red" mt={6} lineClamp={2}>
          {quotation.rejectionReason}
        </Text>
      )}

      {quotation.status === "DRAFT" && onSubmitForApproval && (
        <Button
          fullWidth
          mt="sm"
          size="compact-sm"
          variant="light"
          disabled={busy}
          leftSection={<IconSend size={14} />}
          onClick={stop(() => onSubmitForApproval(quotation))}
        >
          Send for approval
        </Button>
      )}

      {quotation.status === "PENDING_APPROVAL" && (onApprove || onReject) && (
        <Group gap="xs" mt="sm" grow>
          {onReject && (
            <Button
              size="compact-sm"
              color="red"
              variant="light"
              disabled={busy}
              leftSection={<IconX size={14} />}
              onClick={stop(() => onReject(quotation))}
            >
              Reject
            </Button>
          )}
          {onApprove && (
            <Button
              size="compact-sm"
              color="green"
              variant="light"
              disabled={busy}
              leftSection={<IconCircleCheck size={14} />}
              onClick={stop(() => onApprove(quotation))}
            >
              Approve
            </Button>
          )}
        </Group>
      )}

      {quotation.status === "REJECTED" && onEdit && (
        <Button
          fullWidth
          mt="sm"
          size="compact-sm"
          variant="light"
          color="orange"
          disabled={busy}
          leftSection={<IconPencil size={14} />}
          onClick={stop(() => onEdit(quotation))}
        >
          Edit &amp; resubmit
        </Button>
      )}
    </Card>
  );
}
