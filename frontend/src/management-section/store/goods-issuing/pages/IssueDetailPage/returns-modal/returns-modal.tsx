import { useState } from "react";
import { Button, Group, Modal, NumberInput, Stack, Text } from "@mantine/core";
import { useMutation } from "@tanstack/react-query";
import { notifyError, notifySuccess } from "@core/notify";
import { returnIssueItems, type ReturnLineInput } from "../../../api";

interface ReturnRow {
  itemId: string;
  label: string;
  outstanding: number;
}

interface ReturnsModalProps {
  opened: boolean;
  onClose: () => void;
  issueId: string;
  lines: ReturnRow[];
  onDone: () => void;
}

export function ReturnsModal({ opened, onClose, issueId, lines, onDone }: ReturnsModalProps) {
  const [qty, setQty] = useState<Record<string, number | "">>({});

  const mutation = useMutation({
    mutationFn: () => {
      const payload: ReturnLineInput[] = lines
        .map((l) => ({ itemId: l.itemId, quantity: Number(qty[l.itemId] || 0) }))
        .filter((l) => l.quantity > 0);
      return returnIssueItems(issueId, payload);
    },
    onSuccess: () => {
      notifySuccess("Return recorded");
      setQty({});
      onClose();
      onDone();
    },
    onError: notifyError,
  });

  const anyQty = lines.some((l) => Number(qty[l.itemId] || 0) > 0);

  return (
    <Modal opened={opened} onClose={onClose} title="Record return" centered>
      <Stack>
        {lines.map((l) => (
          <Group key={l.itemId} justify="space-between">
            <div>
              <Text size="sm">{l.label}</Text>
              <Text size="xs" c="dimmed">
                Outstanding: {l.outstanding}
              </Text>
            </div>
            <NumberInput
              w={120}
              min={0}
              max={l.outstanding}
              value={qty[l.itemId] ?? ""}
              onChange={(v) => setQty((p) => ({ ...p, [l.itemId]: v === "" ? "" : Number(v) }))}
            />
          </Group>
        ))}
        <Group justify="flex-end">
          <Button variant="default" onClick={onClose}>
            Cancel
          </Button>
          <Button loading={mutation.isPending} disabled={!anyQty} onClick={() => mutation.mutate()}>
            Record
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
}
