import { useState } from "react";
import { Button, Card, Group, Stack } from "@mantine/core";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { PageHeader } from "@ui/layout/PageHeader";
import { UserSelect } from "@ui/primitives/UserSelect";
import { LineItemsEditor, newLine, type EditableLine } from "@ui/primitives/LineItemsEditor";
import { useAuth } from "@auth/AuthContext";
import { createIssue } from "@store/goods-issuing/issuing.api";
import { notifyError, notifySuccess } from "@core/notify";

export function NewIssuePage() {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const { userId } = useAuth();

  const [borrowingUserId, setBorrowingUserId] = useState<string | null>(null);
  const [lines, setLines] = useState<EditableLine[]>([newLine(false, true)]);

  const validLines = lines.filter((l) => l.itemId && l.quantity !== "" && Number(l.quantity) > 0);
  const canSubmit = !!borrowingUserId && !!userId && validLines.length > 0;

  const mutation = useMutation({
    mutationFn: () =>
      createIssue({
        borrowingUserId: borrowingUserId!,
        storeKeeperId: userId!,
        lines: validLines.map((l) => ({
          itemId: l.itemId!,
          quantity: Number(l.quantity),
          returnable: !!l.returnable,
        })),
      }),
    onSuccess: (issue) => {
      notifySuccess(`Issue ${issue.issueNumber} created`);
      qc.invalidateQueries({ queryKey: ["issues"] });
      navigate(`/issuing/${issue.id}`);
    },
    onError: notifyError,
  });

  return (
    <div>
      <PageHeader title="New goods issue" />
      <Card withBorder radius="md" padding="lg">
        <Stack>
          <UserSelect
            label="Borrowing user"
            value={borrowingUserId}
            onChange={setBorrowingUserId}
          />
          <LineItemsEditor lines={lines} onChange={setLines} showReturnable />
          <Group justify="flex-end">
            <Button variant="default" onClick={() => navigate("/issuing")}>
              Cancel
            </Button>
            <Button
              onClick={() => mutation.mutate()}
              loading={mutation.isPending}
              disabled={!canSubmit}
            >
              Create issue
            </Button>
          </Group>
        </Stack>
      </Card>
    </div>
  );
}
