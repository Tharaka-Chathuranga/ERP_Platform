import { Alert, Button, Group, Modal, Stack, Text } from "@mantine/core";
import { IconAlertTriangle } from "@tabler/icons-react";
import type { OilMartQuotation } from "@core/types";
import { DocumentLinesTable } from "../document-lines-table";
import { DocumentTotals } from "../document-totals";

interface ApproveDocumentModalProps {
  opened: boolean;
  quotation?: OilMartQuotation;
  title?: string;
  description?: string;
  confirmLabel?: string;
  submitting?: boolean;
  onClose: () => void;
  onSubmit: () => void;
}

export function ApproveDocumentModal({
  opened,
  quotation,
  title = "Approve quotation",
  description,
  confirmLabel = "Approve",
  submitting,
  onClose,
  onSubmit,
}: ApproveDocumentModalProps) {
  return (
    <Modal opened={opened} onClose={onClose} title={title} centered size="xl">
      <Stack gap="md">
        <Text size="sm" c="dimmed">
          {description ??
            `${quotation?.quotationNo} for ${quotation?.clientName} will be approved and can then be invoiced.`}
        </Text>

        {quotation?.expired && (
          <Alert color="red" variant="light" icon={<IconAlertTriangle size={18} />}>
            This quotation expired on {quotation.validUntil}. It must be edited with current dates
            before it can be approved.
          </Alert>
        )}

        {quotation && (
          <>
            <DocumentLinesTable lines={quotation.lines} showProfit />
            <DocumentTotals
              subtotal={quotation.subtotal}
              gstRatePercent={quotation.gstRatePercent}
              gstAmount={quotation.gstAmount}
              grandTotal={quotation.grandTotal}
              totalProfit={quotation.totalProfit}
            />
          </>
        )}

        <Group justify="flex-end">
          <Button variant="default" onClick={onClose} disabled={submitting}>
            Cancel
          </Button>
          <Button color="green" loading={submitting} onClick={onSubmit} disabled={quotation?.expired}>
            {confirmLabel}
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
}
