import { Alert, Button, Card, Group, Stack, Text } from "@mantine/core";
import {
  IconBan,
  IconCircleCheck,
  IconClipboardCheck,
  IconGavel,
  IconInfoCircle,
  IconReceipt,
  IconTruckDelivery,
  IconX,
} from "@tabler/icons-react";
import { Can } from "@auth/Can";
import { useCan } from "@auth/useCan";
import { OILMART_SALE_APPROVE, OILMART_SALE_CREATE } from "@auth/permissions";
import type { OilMartSale } from "@core/types";

interface SaleStageActionsProps {
  sale: OilMartSale;
  busy?: boolean;
  onConfirmOrder: () => void;
  onApprove: () => void;
  onReject: () => void;
  onDispatch: () => void;
  onInvoice: () => void;
  onCancel: () => void;
}

export function SaleStageActions({
  sale,
  busy,
  onConfirmOrder,
  onApprove,
  onReject,
  onDispatch,
  onInvoice,
  onCancel,
}: SaleStageActionsProps) {
  const can = useCan();

  if (sale.status === "INVOICED") {
    return (
      <Alert color="green" variant="light" icon={<IconCircleCheck size={18} />} mb="lg">
        Completed. Invoice {sale.invoiceNo} was raised and settled.
      </Alert>
    );
  }

  if (sale.status === "REJECTED") {
    return (
      <Alert color="red" variant="light" icon={<IconX size={18} />} title="Rejected" mb="lg">
        {sale.rejectionReason ?? "No reason recorded."}
      </Alert>
    );
  }

  if (sale.status === "CANCELLED") {
    return (
      <Alert color="gray" variant="light" icon={<IconBan size={18} />} title="Cancelled" mb="lg">
        {sale.cancellationReason ?? "No reason recorded."}
      </Alert>
    );
  }

  const canApprove = can(OILMART_SALE_APPROVE);

  return (
    <Card withBorder radius="md" padding="lg" mb="lg">
      <Group justify="space-between" wrap="wrap" gap="md">
        <Stack gap={2}>
          <Text fw={600}>Next step</Text>
          <Text size="sm" c="dimmed">
            {sale.status === "QUOTATION" && "Confirm the quotation to raise a sales order."}
            {sale.status === "ORDERED" &&
              (canApprove
                ? "Review the pricing, then approve or reject this order."
                : "Waiting for a stores manager to approve this order.")}
            {sale.status === "APPROVED" && "Dispatch the oil — this deducts stock."}
            {sale.status === "DISPATCHED" && "Raise the invoice to complete the sale."}
          </Text>
        </Stack>

        <Group gap="sm">
          {sale.status === "QUOTATION" && (
            <Can perform={OILMART_SALE_CREATE}>
              <Button variant="default" leftSection={<IconBan size={16} />} onClick={onCancel} disabled={busy}>
                Cancel sale
              </Button>
              <Button leftSection={<IconClipboardCheck size={16} />} onClick={onConfirmOrder} loading={busy}>
                Confirm order
              </Button>
            </Can>
          )}

          {sale.status === "ORDERED" && (
            <Can
              perform={OILMART_SALE_APPROVE}
              fallback={
                <Alert color="yellow" variant="light" icon={<IconInfoCircle size={16} />} py={6}>
                  Awaiting manager approval
                </Alert>
              }
            >
              <Button color="red" variant="light" leftSection={<IconX size={16} />} onClick={onReject} disabled={busy}>
                Reject
              </Button>
              <Button color="blue" leftSection={<IconGavel size={16} />} onClick={onApprove} loading={busy}>
                Approve
              </Button>
            </Can>
          )}

          {sale.status === "APPROVED" && (
            <Can perform={OILMART_SALE_CREATE}>
              <Button color="grape" leftSection={<IconTruckDelivery size={16} />} onClick={onDispatch} loading={busy}>
                Dispatch
              </Button>
            </Can>
          )}

          {sale.status === "DISPATCHED" && (
            <Can perform={OILMART_SALE_CREATE}>
              <Button color="green" leftSection={<IconReceipt size={16} />} onClick={onInvoice} loading={busy}>
                Raise invoice
              </Button>
            </Can>
          )}
        </Group>
      </Group>
    </Card>
  );
}
