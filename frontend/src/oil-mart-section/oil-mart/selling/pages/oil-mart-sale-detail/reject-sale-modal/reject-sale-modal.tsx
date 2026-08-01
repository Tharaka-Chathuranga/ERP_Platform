import { Button, Group, Modal, Stack, Text, Textarea } from "@mantine/core";
import { useEffect, useState } from "react";

interface RejectSaleModalProps {
  opened: boolean;
  saleNo?: string;
  submitting?: boolean;
  onClose: () => void;
  onSubmit: (reason: string) => void;
}

export function RejectSaleModal({
  opened,
  saleNo,
  submitting,
  onClose,
  onSubmit,
}: RejectSaleModalProps) {
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
    <Modal opened={opened} onClose={onClose} title="Reject sale" centered>
      <Stack gap="sm">
        <Text size="sm" c="dimmed">
          {saleNo} will move to Rejected and can no longer be dispatched.
        </Text>
        <Textarea
          label="Rejection reason"
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
            Reject sale
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
}
