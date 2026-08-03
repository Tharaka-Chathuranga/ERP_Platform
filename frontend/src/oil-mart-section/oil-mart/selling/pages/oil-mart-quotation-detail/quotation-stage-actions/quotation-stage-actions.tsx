import { Alert, Button, Card, Group, Text } from "@mantine/core";
import {
  IconAlertTriangle,
  // IconBan,
  IconCircleCheck,
  IconFileTypePdf,
  IconPencil,
  IconSend,
  IconX,
} from "@tabler/icons-react";
import type { OilMartQuotation } from "@core/types";

interface QuotationStageActionsProps {
  quotation: OilMartQuotation;
  canCreate?: boolean;
  canApprove?: boolean;
  busy?: boolean;
  onSubmitForApproval: () => void;
  onApprove: () => void;
  onReject: () => void;
  onCancel: () => void;
  onEdit: () => void;
  onPreviewPdf: () => void;
}

export function QuotationStageActions({
  quotation,
  canCreate,
  canApprove,
  busy,
  onSubmitForApproval,
  onApprove,
  onReject,
  // onCancel,
  onEdit,
  onPreviewPdf,
}: QuotationStageActionsProps) {
  const editable = quotation.editable;
  const awaitingApproval = quotation.status === "PENDING_APPROVAL";

  return (
    <Card withBorder radius="md" padding="lg" mb="lg">
      {quotation.status === "REJECTED" && quotation.rejectionReason && (
        <Alert
          color="red"
          variant="light"
          icon={<IconAlertTriangle size={18} />}
          title="Rejected by the approver"
          mb="md"
        >
          {quotation.rejectionReason}
          <Text size="sm" mt={4}>
            Edit the quotation to fix this — saving sends it straight back for approval.
          </Text>
        </Alert>
      )}

      {quotation.expired && quotation.status !== "CANCELLED" && (
        <Alert color="orange" variant="light" icon={<IconAlertTriangle size={18} />} mb="md">
          This quotation is not valid now — it needs to be edited with current dates before it can
          be approved or invoiced.
        </Alert>
      )}

      <Group justify="space-between">
        <Button variant="default" leftSection={<IconFileTypePdf size={16} />} onClick={onPreviewPdf}>
          Preview client PDF
        </Button>

        <Group gap="sm">
          {canCreate && editable && (
            <Button variant="light" leftSection={<IconPencil size={16} />} onClick={onEdit}>
              Edit
            </Button>
          )}

          {canCreate && quotation.status === "DRAFT" && (
            <Button
              leftSection={<IconSend size={16} />}
              loading={busy}
              onClick={onSubmitForApproval}
            >
              Send for approval
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
                Approve
              </Button>
            </>
          )}

          {/*
          {canCreate && quotation.status !== "APPROVED" && quotation.status !== "CANCELLED" && (
            <Button
              color="dark"
              variant="subtle"
              leftSection={<IconBan size={16} />}
              disabled={busy}
              onClick={onCancel}
            >
              Cancel
            </Button>
          )}
          */}
        </Group>
      </Group>
    </Card>
  );
}
