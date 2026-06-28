import { useEffect, useState } from "react";
import { Button, Group, Modal, NumberInput, Stack, Textarea } from "@mantine/core";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@auth/AuthContext";
import { qk } from "@core/queryKeys";
import { notifyError, notifySuccess } from "@core/notify";
import type { FuelTank } from "@core/types";
import { recordReading } from "./fuel.api";

interface RecordReadingModalProps {
  opened: boolean;
  onClose: () => void;
  tank?: FuelTank;
}

/** Record a timed level reading; reconciles the tank's running level to it. */
export function RecordReadingModal({ opened, onClose, tank }: RecordReadingModalProps) {
  const qc = useQueryClient();
  const { userId } = useAuth();
  const [litresMeasured, setLitres] = useState<number | "">("");
  const [note, setNote] = useState("");

  useEffect(() => {
    if (opened) {
      setLitres("");
      setNote("");
    }
  }, [opened]);

  const mutation = useMutation({
    mutationFn: () =>
      recordReading(tank!.id, {
        litresMeasured: Number(litresMeasured),
        recordedByUserId: userId!,
        note: note || undefined,
      }),
    onSuccess: () => {
      notifySuccess("Reading recorded");
      qc.invalidateQueries({ queryKey: qk.fuelTanks() });
      qc.invalidateQueries({ queryKey: qk.tankReadings(tank!.id) });
      onClose();
    },
    onError: notifyError,
  });

  return (
    <Modal opened={opened} onClose={onClose} title={`Record reading — ${tank?.name ?? ""}`} centered>
      <Stack>
        <NumberInput
          label="Measured level (L)"
          description="How much fuel the tank holds at this moment"
          min={0}
          decimalScale={2}
          value={litresMeasured}
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
            disabled={litresMeasured === "" || Number(litresMeasured) < 0 || !userId}
            onClick={() => mutation.mutate()}
          >
            Record
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
}
