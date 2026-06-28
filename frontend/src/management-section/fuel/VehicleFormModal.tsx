import { useEffect, useState } from "react";
import { Button, Group, Modal, NumberInput, Stack, Textarea, TextInput } from "@mantine/core";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { UserSelect } from "@ui/primitives/UserSelect";
import { qk } from "@core/queryKeys";
import { notifyError, notifySuccess } from "@core/notify";
import type { Vehicle } from "@core/types";
import { createVehicle, updateVehicle, type VehicleInput } from "./fuel.api";

interface VehicleFormModalProps {
  opened: boolean;
  onClose: () => void;
  /** When set, the form edits this vehicle instead of creating a new one. */
  vehicle?: Vehicle;
}

/** Create or edit a vehicle. The driver is the default receiving user on issues. */
export function VehicleFormModal({ opened, onClose, vehicle }: VehicleFormModalProps) {
  const qc = useQueryClient();
  const editing = !!vehicle;

  const [vehicleNumber, setVehicleNumber] = useState("");
  const [capacity, setCapacity] = useState<number | "">("");
  const [description, setDescription] = useState("");
  const [driverUserId, setDriverUserId] = useState<string | null>(null);

  useEffect(() => {
    if (opened) {
      setVehicleNumber(vehicle?.vehicleNumber ?? "");
      setCapacity(vehicle?.fullTankCapacityLitres ?? "");
      setDescription(vehicle?.description ?? "");
      setDriverUserId(vehicle?.driverUserId ?? null);
    }
  }, [opened, vehicle]);

  const mutation = useMutation({
    mutationFn: () => {
      const input: VehicleInput = {
        vehicleNumber,
        fullTankCapacityLitres: Number(capacity || 0),
        description: description || undefined,
        driverUserId: driverUserId || undefined,
      };
      return editing ? updateVehicle(vehicle!.id, input) : createVehicle(input);
    },
    onSuccess: () => {
      notifySuccess(editing ? "Vehicle updated" : "Vehicle created");
      qc.invalidateQueries({ queryKey: qk.vehicles() });
      onClose();
    },
    onError: notifyError,
  });

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={editing ? "Edit vehicle" : "New vehicle"}
      centered
      styles={{ title: { fontSize: "var(--mantine-font-size-xl)", fontWeight: 700 } }}
    >
      <Stack>
        <TextInput
          label="Vehicle number"
          value={vehicleNumber}
          onChange={(e) => setVehicleNumber(e.currentTarget.value)}
          required
        />
        <NumberInput
          label="Full tank capacity (L)"
          min={0}
          decimalScale={2}
          value={capacity}
          onChange={(v) => setCapacity(v === "" ? "" : Number(v))}
          required
        />
        <UserSelect
          label="Driver (default receiving user)"
          value={driverUserId}
          onChange={setDriverUserId}
          placeholder="Select driver"
        />
        <Textarea
          label="Description"
          value={description}
          onChange={(e) => setDescription(e.currentTarget.value)}
          autosize
          minRows={2}
        />
        <Group justify="space-between">
          <Button variant="default" onClick={onClose}>
            Cancel
          </Button>
          <Button
            loading={mutation.isPending}
            disabled={!vehicleNumber || capacity === "" || Number(capacity) <= 0}
            onClick={() => mutation.mutate()}
          >
            {editing ? "Save" : "Create"}
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
}
