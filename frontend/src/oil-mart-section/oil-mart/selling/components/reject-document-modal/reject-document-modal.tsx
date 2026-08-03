import { Button, Group, Modal, Stack, Text, Textarea } from "@mantine/core";
import { useEffect, useState } from "react";

interface RejectDocumentModalProps {
  opened: boolean;
  documentNo?: string;
  title?: string;
  description?: string;
  confirmLabel?: string;
  submitting?: boolean;
  onClose: () => void;
  onSubmit: (reason: string) => void;
}

export function RejectDocumentModal({
  opened,
  documentNo,
  title = "Reject quotation",
  description,
  confirmLabel = "Reject quotation",
  submitting,
  onClose,
  onSubmit,
}: RejectDocumentModalProps) {
  const [reason, setReason] = useState("");
  const [touched, setTouched] = useState(false);

  useEffect(() => {
    if (opened) {
      setReason("");
      setTouched(false);
    }
  }, [opened]);

  const invalid = !reason.trim();

  return (
    <Modal opened={opened} onClose={onClose} title={title} centered>
      <Stack gap="sm">
        <Text size="sm" c="dimmed">
          {description ??
            `${documentNo} goes back to the person who raised it, who can edit it and resubmit for approval.`}
        </Text>
        <Textarea
          label="Rejection reason"
          description="The author sees this, so say what needs changing."
          withAsterisk
          autosize
          minRows={3}
          value={reason}
          onChange={(event) => setReason(event.currentTarget.value)}
          error={touched && invalid ? "A rejection reason is required" : undefined}
        />
        <Group justify="flex-end" mt="sm">
          <Button variant="default" onClick={onClose} disabled={submitting}>
            Cancel
          </Button>
          <Button
            color="red"
            loading={submitting}
            onClick={() => {
              setTouched(true);
              if (!invalid) onSubmit(reason.trim());
            }}
          >
            {confirmLabel}
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
}
