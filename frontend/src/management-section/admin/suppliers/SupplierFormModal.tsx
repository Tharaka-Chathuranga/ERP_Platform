import { useState } from "react";
import { Button, Group, Modal, Stack, TextInput } from "@mantine/core";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { qk } from "@core/queryKeys";
import { notifyError, notifySuccess } from "@core/notify";
import { createSupplier } from "@store/inventory/suppliers.api";

/** Creates a new supplier. */
export function SupplierFormModal({ opened, onClose }: { opened: boolean; onClose: () => void }) {
  const qc = useQueryClient();
  const [code, setCode] = useState("");
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [country, setCountry] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");

  const reset = () => {
    setCode("");
    setName("");
    setAddress("");
    setCountry("");
    setEmail("");
    setPhone("");
  };

  const mutation = useMutation({
    mutationFn: () =>
      createSupplier({
        code,
        name,
        address: address || undefined,
        country: country || undefined,
        email: email || undefined,
        phone: phone || undefined,
      }),
    onSuccess: () => {
      notifySuccess("Supplier created");
      qc.invalidateQueries({ queryKey: qk.suppliers() });
      qc.invalidateQueries({ queryKey: qk.adminSummary() });
      reset();
      onClose();
    },
    onError: notifyError,
  });

  return (
    <Modal opened={opened} onClose={onClose} title="New supplier" centered>
      <Stack>
        <Group grow>
          <TextInput label="Code" value={code} onChange={(e) => setCode(e.currentTarget.value)} required />
          <TextInput label="Name" value={name} onChange={(e) => setName(e.currentTarget.value)} required />
        </Group>
        <TextInput label="Address" value={address} onChange={(e) => setAddress(e.currentTarget.value)} />
        <Group grow>
          <TextInput label="Country" value={country} onChange={(e) => setCountry(e.currentTarget.value)} />
          <TextInput label="Phone" value={phone} onChange={(e) => setPhone(e.currentTarget.value)} />
        </Group>
        <TextInput label="Email" value={email} onChange={(e) => setEmail(e.currentTarget.value)} />
        <Group justify="flex-end">
          <Button variant="default" onClick={onClose}>
            Cancel
          </Button>
          <Button loading={mutation.isPending} disabled={!code || !name} onClick={() => mutation.mutate()}>
            Create
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
}
