import { Button, Group } from "@mantine/core";
import { IconArrowLeft, IconCheck, IconX } from "@tabler/icons-react";
import type { BorrowRequest } from "@core/types";

interface RequestDetailActionsProps {
  request: BorrowRequest;
  isAdmin: boolean;
  approvePending: boolean;
  rejectPending: boolean;
  onBack: () => void;
  onApprove: () => void;
  onReject: () => void;
}

export function RequestDetailActions({
  request,
  isAdmin,
  approvePending,
  rejectPending,
  onBack,
  onApprove,
  onReject,
}: RequestDetailActionsProps) {
  return (
    <Group>
      <Button
        variant="default"
        leftSection={<IconArrowLeft size={16} />}
        onClick={onBack}
      >
        Back
      </Button>
      {isAdmin && request.status === "PENDING" && (
        <>
          <Button
            color="green"
            leftSection={<IconCheck size={16} />}
            loading={approvePending}
            onClick={onApprove}
          >
            Approve
          </Button>
          <Button
            color="red"
            variant="light"
            leftSection={<IconX size={16} />}
            loading={rejectPending}
            onClick={onReject}
          >
            Reject
          </Button>
        </>
      )}
    </Group>
  );
}
