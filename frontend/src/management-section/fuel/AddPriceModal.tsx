import { useEffect, useState } from "react";
import { Button, Group, Modal, NumberInput, Stack, Textarea } from "@mantine/core";
import { DatePickerInput } from "@mantine/dates";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import dayjs from "dayjs";
import { useAuth } from "@auth/AuthContext";
import { qk } from "@core/queryKeys";
import { notifyError, notifySuccess } from "@core/notify";
import { addFuelPrice } from "./fuel.api";

interface AddPriceModalProps {
  opened: boolean;
  onClose: () => void;
}

/** Append a dated price to the history. Existing prices are never modified. */
export function AddPriceModal({ opened, onClose }: AddPriceModalProps) {
  const qc = useQueryClient();
  const { userId } = useAuth();
  const [unitPrice, setUnitPrice] = useState<number | "">("");
  const [from, setFrom] = useState<Date | null>(null);
  const [to, setTo] = useState<Date | null>(null);
  const [note, setNote] = useState("");

  useEffect(() => {
    if (opened) {
      setUnitPrice("");
      setFrom(null);
      setTo(null);
      setNote("");
    }
  }, [opened]);

  const mutation = useMutation({
    mutationFn: () =>
      addFuelPrice({
        unitPrice: Number(unitPrice),
        effectiveFrom: dayjs(from).format("YYYY-MM-DD"),
        effectiveTo: dayjs(to).format("YYYY-MM-DD"),
        recordedByUserId: userId!,
        note: note || undefined,
      }),
    onSuccess: () => {
      notifySuccess("Price added");
      qc.invalidateQueries({ queryKey: qk.fuelPrices() });
      qc.invalidateQueries({ queryKey: qk.currentFuelPrice() });
      qc.invalidateQueries({ queryKey: qk.fuelOverview() });
      onClose();
    },
    onError: notifyError,
  });

  const valid = unitPrice !== "" && Number(unitPrice) >= 0 && from && to && !dayjs(to).isBefore(dayjs(from));

  return (
    <Modal opened={opened} onClose={onClose} title="Add fuel price" centered>
      <Stack>
        <NumberInput
          label="Unit price (per L)"
          min={0}
          decimalScale={4}
          value={unitPrice}
          onChange={(v) => setUnitPrice(v === "" ? "" : Number(v))}
          required
        />
        <Group grow>
          <DatePickerInput label="Effective from" value={from} onChange={setFrom} valueFormat="MMM D, YYYY" required />
          <DatePickerInput label="Effective to" value={to} onChange={setTo} valueFormat="MMM D, YYYY" required />
        </Group>
        <Textarea label="Note" value={note} onChange={(e) => setNote(e.currentTarget.value)} autosize minRows={2} />
        <Group justify="flex-end">
          <Button variant="default" onClick={onClose}>
            Cancel
          </Button>
          <Button loading={mutation.isPending} disabled={!valid || !userId} onClick={() => mutation.mutate()}>
            Add price
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
}
