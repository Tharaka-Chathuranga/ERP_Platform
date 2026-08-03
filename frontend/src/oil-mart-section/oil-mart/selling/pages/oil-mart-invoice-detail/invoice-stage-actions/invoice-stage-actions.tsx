import { Alert, Button, Card, Group, Text } from "@mantine/core";
import {
  IconAlertTriangle,
  IconCircleCheck,
  IconFileTypePdf,
  IconReplace,
  IconX,
} from "@tabler/icons-react";
import type { OilMartInvoice } from "@core/types";

interface InvoiceStageActionsProps {
  invoice: OilMartInvoice;
  canCreate?: boolean;
  canApprove?: boolean;
  busy?: boolean;
  onApprove: () => void;
  onReject: () => void;
  onReselect: () => void;
  onPreviewPdf: () => void;
}

export function InvoiceStageActions({
  invoice,
  canCreate,
  canApprove,
  busy,
  onApprove,
  onReject,
  onReselect,
  onPreviewPdf,
}: InvoiceStageActionsProps) {
  const awaitingApproval = invoice.status === "PENDING_APPROVAL";

  return (
    <Card withBorder radius="md" padding="lg" mb="lg">
      {invoice.status === "REJECTED" && (
        <Alert
          color="red"
          variant="light"
          icon={<IconAlertTriangle size={18} />}
          title="Rejected by the approver"
          mb="md"
        >
          {invoice.rejectionReason}
          <Text size="sm" mt={4}>
            Pick the correct quotation for this invoice — it then goes back for approval under the
            same invoice number.
          </Text>
        </Alert>
      )}

      {invoice.status === "APPROVED" && (
        <Alert color="green" variant="light" icon={<IconCircleCheck size={18} />} mb="md">
          Approved — stock has been deducted for every line on this invoice.
        </Alert>
      )}

      <Group justify="space-between">
        <Button variant="default" leftSection={<IconFileTypePdf size={16} />} onClick={onPreviewPdf}>
          Preview client PDF
        </Button>

        <Group gap="sm">
          {canCreate && invoice.status === "REJECTED" && (
            <Button
              variant="light"
              color="orange"
              leftSection={<IconReplace size={16} />}
              disabled={busy}
              onClick={onReselect}
            >
              Select another quotation
            </Button>
          )}

          {canApprove && awaitingApproval && (
            <>
              <Button
                color="red"
                variant="light"
                leftSection={<IconX size={16} />}
                disabled={busy}
                onClick={onReject}
              >
                Reject
              </Button>
              <Button
                color="green"
                leftSection={<IconCircleCheck size={16} />}
                disabled={busy}
                onClick={onApprove}
              >
                Approve &amp; deduct stock
              </Button>
            </>
          )}

        </Group>
      </Group>
    </Card>
  );
}
