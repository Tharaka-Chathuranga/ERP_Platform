import { useEffect, useState } from "react";
import { Button, Group, Modal, Stack, TextInput } from "@mantine/core";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { qk } from "@core/queryKeys";
import { notifyError, notifySuccess } from "@core/notify";
import type { FuelTank } from "@core/types";
import { updateTank } from "../../api";

interface EditTankModalProps {
  opened: boolean;
  onClose: () => void;
  tank?: FuelTank;
}

export function EditTankModal({ opened, onClose, tank }: EditTankModalProps) {
  const qc = useQueryClient();
  const [name, setName] = useState("");

  useEffect(() => {
    if (opened && tank) {
      setName(tank.name);
    }
  }, [opened, tank]);

  const mutation = useMutation({
    // Capacity is fixed and not editable — re-send the tank's existing value unchanged.
    mutationFn: () => updateTank(tank!.id, { name, capacityLitres: tank!.capacityLitres }),
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
        <Group justify="flex-end">
          <Button variant="default" onClick={onClose}>
            Cancel
          </Button>
          <Button loading={mutation.isPending} disabled={!name} onClick={() => mutation.mutate()}>
            Save
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
}
