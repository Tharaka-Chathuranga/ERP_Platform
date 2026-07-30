import { Button, Group, Text } from "@mantine/core";
import { IconCheck, IconX } from "@tabler/icons-react";
import type { CountAdjustmentStatus } from "@core/types";

interface CountRequestActionsProps {
  status: CountAdjustmentStatus;
  busy: boolean;
  onApprove: () => void;
  onReject: () => void;
}

export function CountRequestActions({ status, busy, onApprove, onReject }: CountRequestActionsProps) {
  if (status !== "PENDING") {
    return <Text size="xs" c="dimmed">Already taken</Text>;
  }

  return (
    <Group gap="xs" justify="flex-end" wrap="nowrap">
      <Button size="xs" variant="light" color="green" leftSection={<IconCheck size={14} />} styles={{ root: { paddingInline: 8, paddingBlock: 1 }, section: { marginInlineEnd: 2 } }} onClick={() => !busy && onApprove()}>
        Approve
      </Button>
      <Button size="xs" variant="light" color="red" leftSection={<IconX size={14} />} styles={{ root: { paddingInline: 8, paddingBlock: 1 }, section: { marginInlineEnd: 2 } }} onClick={() => !busy && onReject()}>
        Reject
      </Button>
    </Group>
  );
}
