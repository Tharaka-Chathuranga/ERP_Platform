import { useEffect, useState } from "react";
import { Button, Group, Modal, NumberInput, Stack, Textarea } from "@mantine/core";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@auth/AuthContext";
import { qk } from "@core/queryKeys";
import { notifyError, notifySuccess } from "@core/notify";
import type { FuelTank } from "@core/types";
import { recordRefill } from "../../api";

interface RecordRefillModalProps {
  opened: boolean;
  onClose: () => void;
  tank?: FuelTank;
}

/** Record a fuel delivery into a tank; adds to its running level. */
export function RecordRefillModal({ opened, onClose, tank }: RecordRefillModalProps) {
  const qc = useQueryClient();
  const { userId } = useAuth();
  const [litres, setLitres] = useState<number | "">("");
  const [note, setNote] = useState("");

  useEffect(() => {
    if (opened) {
      setLitres("");
      setNote("");
    }
  }, [opened]);

  const mutation = useMutation({
    mutationFn: () =>
      recordRefill(tank!.id, { litres: Number(litres), recordedByUserId: userId!, note: note || undefined }),
    onSuccess: () => {
      notifySuccess("Refill recorded");
      qc.invalidateQueries({ queryKey: qk.fuelTanks() });
      qc.invalidateQueries({ queryKey: qk.tankRefills(tank!.id) });
      onClose();
    },
    onError: notifyError,
  });

  return (
    <Modal opened={opened} onClose={onClose} title={`Record refill — ${tank?.name ?? ""}`} centered>
      <Stack>
        <NumberInput
          label="Litres delivered"
          min={0}
          decimalScale={2}
          value={litres}
          onChange={(v) => setLitres(v === "" ? "" : Number(v))}
          required
        />
        <Textarea label="Note" value={note} onChange={(e) => setNote(e.currentTarget.value)} autosize minRows={2} />
        <Group justify="flex-end">
          <Button variant="default" onClick={onClose}>
            Cancel
          </Button>
          <Button
            loading={mutation.isPending}
            disabled={litres === "" || Number(litres) <= 0 || !userId}
            onClick={() => mutation.mutate()}
          >
            Record
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
}
