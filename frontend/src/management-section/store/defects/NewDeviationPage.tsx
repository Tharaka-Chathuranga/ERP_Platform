import { useState } from "react";
import { Button, Card, Group, Stack, Textarea } from "@mantine/core";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { PageHeader } from "@ui/layout/PageHeader";
import { LineItemsEditor, newLine, type EditableLine } from "@ui/primitives/LineItemsEditor";
import { useAuth } from "@auth/AuthContext";
import { createDeviation } from "@store/defects/deviations.api";
import { notifyError, notifySuccess } from "@core/notify";

export function NewDeviationPage() {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const { userId } = useAuth();

  const [reason, setReason] = useState("");
  const [lines, setLines] = useState<EditableLine[]>([newLine()]);

  const validLines = lines.filter((l) => l.itemId && l.quantity !== "" && Number(l.quantity) > 0);
  const canSubmit = !!userId && validLines.length > 0;

  const mutation = useMutation({
    mutationFn: () =>
      createDeviation({
        reason: reason || undefined,
        requestedByUserId: userId!,
        items: validLines.map((l) => ({ itemId: l.itemId!, quantity: Number(l.quantity) })),
      }),
    onSuccess: (d) => {
      notifySuccess("Defect report created");
      qc.invalidateQueries({ queryKey: ["deviations"] });
      navigate(`/defects/${d.id}`);
    },
    onError: notifyError,
  });

  return (
    <div>
      <PageHeader title="Report defect" />
      <Card withBorder radius="md" padding="lg">
        <Stack>
          <Textarea
            label="Reason"
            placeholder="Describe the defect / deviation"
            autosize
            minRows={3}
            value={reason}
            onChange={(e) => setReason(e.currentTarget.value)}
          />
          <LineItemsEditor lines={lines} onChange={setLines} />
          <Group justify="flex-end">
            <Button variant="default" onClick={() => navigate("/defects")}>
              Cancel
            </Button>
            <Button
              onClick={() => mutation.mutate()}
              loading={mutation.isPending}
              disabled={!canSubmit}
            >
              Submit report
            </Button>
          </Group>
        </Stack>
      </Card>
    </div>
  );
}
