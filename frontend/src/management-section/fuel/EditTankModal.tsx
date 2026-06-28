import { useEffect, useState } from "react";
import { Button, Group, Modal, NumberInput, Stack, TextInput } from "@mantine/core";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { qk } from "@core/queryKeys";
import { notifyError, notifySuccess } from "@core/notify";
import type { FuelTank } from "@core/types";
import { updateTank } from "./fuel.api";

interface EditTankModalProps {
  opened: boolean;
  onClose: () => void;
  tank?: FuelTank;
}

/** Edit a tank's display name and capacity (purpose and level are fixed). */
export function EditTankModal({ opened, onClose, tank }: EditTankModalProps) {
  const qc = useQueryClient();
  const [name, setName] = useState("");
  const [capacity, setCapacity] = useState<number | "">("");

  useEffect(() => {
    if (opened && tank) {
      setName(tank.name);
      setCapacity(tank.capacityLitres);
    }
  }, [opened, tank]);

  const mutation = useMutation({
    mutationFn: () => updateTank(tank!.id, { name, capacityLitres: Number(capacity || 0) }),
    onSuccess: () => {
      notifySuccess("Tank updated");
      qc.invalidateQueries({ queryKey: qk.fuelTanks() });
      onClose();
    },
    onError: notifyError,
  });

  return (
    <Modal opened={opened} onClose={onClose} title={`Edit tank — ${tank?.name ?? ""}`} centered>
      <Stack>
        <TextInput label="Name" value={name} onChange={(e) => setName(e.currentTarget.value)} required />
        <NumberInput
          label="Capacity (L)"
          min={0}
          decimalScale={2}
          value={capacity}
          onChange={(v) => setCapacity(v === "" ? "" : Number(v))}
          required
        />
        <Group justify="flex-end">
          <Button variant="default" onClick={onClose}>
            Cancel
          </Button>
          <Button loading={mutation.isPending} disabled={!name || capacity === ""} onClick={() => mutation.mutate()}>
            Save
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
}
