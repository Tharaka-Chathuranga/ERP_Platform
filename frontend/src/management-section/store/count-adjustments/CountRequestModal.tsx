import { useState } from "react";
import { Button, Group, Modal, NumberInput, Stack, Textarea } from "@mantine/core";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@auth/AuthContext";
import { qk } from "@core/queryKeys";
import { notifyError, notifySuccess } from "@core/notify";
import { ItemSelect } from "@ui/primitives/ItemSelect";
import { createCountRequest } from "./count-requests.api";

/** Raise a new count-adjustment request (item + target quantity + reason). */
export function CountRequestModal({ opened, onClose }: { opened: boolean; onClose: () => void }) {
  const qc = useQueryClient();
  const { userId } = useAuth();
  const [itemId, setItemId] = useState<string | null>(null);
  const [requestedQuantity, setQuantity] = useState<number | "">("");
  const [reason, setReason] = useState("");

  const reset = () => {
    setItemId(null);
    setQuantity("");
    setReason("");
  };

  const mutation = useMutation({
    mutationFn: () =>
      createCountRequest({
        itemId: itemId!,
        requestedQuantity: Number(requestedQuantity || 0),
        reason: reason || undefined,
        requestedByUserId: userId!,
      }),
    onSuccess: () => {
      notifySuccess("Count request submitted");
      qc.invalidateQueries({ queryKey: qk.countRequests() });
      qc.invalidateQueries({ queryKey: qk.adminSummary() });
      reset();
      onClose();
    },
    onError: notifyError,
  });

  return (
    <Modal opened={opened} onClose={onClose} title="New count request" centered>
      <Stack>
        <ItemSelect value={itemId} onChange={setItemId} label="Item" />
        <NumberInput
          label="New on-hand quantity"
          min={0}
          value={requestedQuantity}
          onChange={(v) => setQuantity(v === "" ? "" : Number(v))}
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
            disabled={!itemId || requestedQuantity === ""}
            onClick={() => mutation.mutate()}
          >
            Submit
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
}
