import type { MouseEvent } from "react";
import { Button, Card, Group, Stack, Text } from "@mantine/core";
import {
  IconAlertTriangle,
  IconFileCheck,
  IconGavel,
  IconSend,
  IconReceipt,
  IconTruckDelivery,
  IconX,
} from "@tabler/icons-react";
import dayjs from "dayjs";
import type { OilMartSale } from "@core/types";
import { MoneyText } from "../../../../components/money-text";

export interface SaleCardActions {
  onSubmitForApproval?: (sale: OilMartSale) => void;
  onApproveQuotation?: (sale: OilMartSale) => void;
  onRejectQuotation?: (sale: OilMartSale) => void;
  onApprove?: (sale: OilMartSale) => void;
  onReject?: (sale: OilMartSale) => void;
  onDispatch?: (sale: OilMartSale) => void;
  onInvoice?: (sale: OilMartSale) => void;
}

interface SaleCardProps extends SaleCardActions {
  sale: OilMartSale;
  onClick: () => void;
  busy?: boolean;
}

export function SaleCard({
  sale,
  onClick,
  busy,
  onSubmitForApproval,
  onApproveQuotation,
  onRejectQuotation,
  onApprove,
  onReject,
  onDispatch,
  onInvoice,
}: SaleCardProps) {
  const overridden = sale.lines.some((line) => line.isPriceOverride);
  const expiringSoon =
    sale.status === "QUOTATION" &&
    sale.validUntil !== undefined &&
    dayjs(sale.validUntil).diff(dayjs(), "day") <= 3;

  const stop = (run: () => void) => (event: MouseEvent) => {
    event.stopPropagation();
    run();
  };

  return (
    <Card withBorder radius="md" padding="sm" onClick={onClick} style={{ cursor: "pointer" }}>
      <Group justify="space-between" wrap="nowrap" mb={6}>
        <Text fw={700} size="sm">
          {sale.saleNo}
        </Text>
        <MoneyText value={sale.total} emphasis />
      </Group>

      <Text size="sm" c="dimmed" lineClamp={1} mb={8}>
        {sale.clientName}
      </Text>

      <Group justify="space-between" wrap="nowrap">
        <Text size="xs" c="dimmed">
          {sale.lines.length} line{sale.lines.length === 1 ? "" : "s"} ·{" "}
          {dayjs(sale.quotedAt).format("MMM D")}
        </Text>
        <Stack gap={2} align="flex-end">
          {overridden && (
            <Group gap={2} wrap="nowrap">
              <IconAlertTriangle size={12} color="var(--mantine-color-orange-6)" />
              <Text size="xs" c="orange">
                Override
              </Text>
            </Group>
          )}
          {expiringSoon && (
            <Text size="xs" c="red" fw={600}>
              Expires {dayjs(sale.validUntil).format("MMM D")}
            </Text>
          )}
        </Stack>
      </Group>

      {sale.status === "QUOTATION" && onSubmitForApproval && (
        <Button
          fullWidth
          mt="sm"
          size="compact-sm"
          variant="light"
          disabled={busy}
          leftSection={<IconSend size={14} />}
          onClick={stop(() => onSubmitForApproval(sale))}
        >
          Send for approval
        </Button>
      )}

      {sale.status === "QUOTATION_APPROVAL" && (onApproveQuotation || onRejectQuotation) && (
        <Group gap="xs" mt="sm" grow>
          {onRejectQuotation && (
            <Button
              size="compact-sm"
              color="red"
              variant="light"
              disabled={busy}
              leftSection={<IconX size={14} />}
              onClick={stop(() => onRejectQuotation(sale))}
            >
              Reject
            </Button>
          )}
          {onApproveQuotation && (
            <Button
              size="compact-sm"
              color="orange"
              variant="light"
              disabled={busy}
              leftSection={<IconFileCheck size={14} />}
              onClick={stop(() => onApproveQuotation(sale))}
            >
              Approve
            </Button>
          )}
        </Group>
      )}

      {sale.status === "ORDERED" && (onApprove || onReject) && (
        <Group gap="xs" mt="sm" grow>
          {onReject && (
            <Button
              size="compact-sm"
              color="red"
              variant="light"
              disabled={busy}
              leftSection={<IconX size={14} />}
              onClick={stop(() => onReject(sale))}
            >
              Reject
            </Button>
          )}
          {onApprove && (
            <Button
              size="compact-sm"
              color="blue"
              variant="light"
              disabled={busy}
              leftSection={<IconGavel size={14} />}
              onClick={stop(() => onApprove(sale))}
            >
              Approve
            </Button>
          )}
        </Group>
      )}

      {sale.status === "APPROVED" && onDispatch && (
        <Button
          fullWidth
          mt="sm"
          size="compact-sm"
          color="grape"
          variant="light"
          disabled={busy}
          leftSection={<IconTruckDelivery size={14} />}
          onClick={stop(() => onDispatch(sale))}
        >
          Dispatch
        </Button>
      )}

      {sale.status === "DISPATCHED" && onInvoice && (
        <Button
          fullWidth
          mt="sm"
          size="compact-sm"
          color="green"
          variant="light"
          disabled={busy}
          leftSection={<IconReceipt size={14} />}
          onClick={stop(() => onInvoice(sale))}
        >
          Raise invoice
        </Button>
      )}
    </Card>
  );
}
