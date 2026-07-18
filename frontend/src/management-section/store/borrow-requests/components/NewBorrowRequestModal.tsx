import { useState } from "react";
import { Button, Group, Modal, Select, Stack, Textarea } from "@mantine/core";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@auth/AuthContext";
import { listIssues } from "@store/goods-issuing";
import { createBorrowRequest } from "../api";
import { notifyError, notifySuccess } from "@core/notify";

export function NewBorrowRequestModal({
  opened,
  onClose,
}: {
  opened: boolean;
  onClose: () => void;
}) {
  const qc = useQueryClient();
  const navigate = useNavigate();
  const { userId } = useAuth();
  const [issueId, setIssueId] = useState<string | null>(null);
  const [reason, setReason] = useState("");

  const issues = useQuery({
    queryKey: ["issues", "ALL"],
    queryFn: () => listIssues(),
    enabled: opened,
  });

  const mutation = useMutation({
    mutationFn: () =>
      createBorrowRequest({ issueId: issueId!, reason: reason || undefined, requestedByUserId: userId! }),
    onSuccess: (r) => {
      notifySuccess("Borrow request created");
      qc.invalidateQueries({ queryKey: ["borrowRequests"] });
      onClose();
      navigate(`/requests/${r.id}`);
    },
    onError: notifyError,
  });

  return (
    <Modal opened={opened} onClose={onClose} title="New borrow request" centered>
      <Stack>
        <Select
          label="Related issue"
          placeholder="Select issue"
          searchable
          data={issues.data?.content.map((i) => ({ value: i.id, label: i.issueNumber })) ?? []}
          value={issueId}
          onChange={setIssueId}
        />
        <Textarea
          label="Reason"
          autosize
          minRows={2}
          value={reason}
          onChange={(e) => setReason(e.currentTarget.value)}
        />
        <Group justify="flex-end">
          <Button variant="default" onClick={onClose}>
            Cancel
          </Button>
          <Button
            loading={mutation.isPending}
            disabled={!issueId || !userId}
            onClick={() => mutation.mutate()}
          >
            Create
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
}
