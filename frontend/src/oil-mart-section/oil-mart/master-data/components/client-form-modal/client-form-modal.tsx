import { Button, Group, Modal, Select, Stack, TextInput, Textarea } from "@mantine/core";
import { useForm } from "@mantine/form";
import { useEffect } from "react";
import type { OilMartClient } from "@core/types";
import type { SaveOilMartClientInput } from "../../api";

interface ClientFormModalProps {
  opened: boolean;
  client?: OilMartClient;
  submitting?: boolean;
  onClose: () => void;
  onSubmit: (values: SaveOilMartClientInput) => void;
}

const EMPTY: SaveOilMartClientInput = {
  code: "",
  name: "",
  contactPerson: "",
  phone: "",
  email: "",
  address: "",
  status: "ACTIVE",
};

export function ClientFormModal({
  opened,
  client,
  submitting,
  onClose,
  onSubmit,
}: ClientFormModalProps) {
  const form = useForm<SaveOilMartClientInput>({
    initialValues: EMPTY,
    validate: {
      code: (value) => (value.trim() ? null : "Code is required"),
      name: (value) => (value.trim() ? null : "Name is required"),
      email: (value) => (!value || /^\S+@\S+\.\S+$/.test(value) ? null : "Enter a valid email"),
    },
  });

  useEffect(() => {
    if (!opened) return;
    form.setValues(
      client
        ? {
            code: client.code,
            name: client.name,
            contactPerson: client.contactPerson ?? "",
            phone: client.phone ?? "",
            email: client.email ?? "",
            address: client.address ?? "",
            status: client.status,
          }
        : EMPTY,
    );
  }, [opened, client]);

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={client ? "Edit client" : "Add client"}
      centered
    >
      <form onSubmit={form.onSubmit(onSubmit)}>
        <Stack gap="sm">
          <Group grow>
            <TextInput label="Code" withAsterisk {...form.getInputProps("code")} />
            <TextInput label="Name" withAsterisk {...form.getInputProps("name")} />
          </Group>
          <TextInput label="Contact person" {...form.getInputProps("contactPerson")} />
          <Group grow>
            <TextInput label="Phone" {...form.getInputProps("phone")} />
            <TextInput label="Email" {...form.getInputProps("email")} />
          </Group>
          <Textarea label="Address" autosize minRows={2} {...form.getInputProps("address")} />
          <Select
            label="Status"
            data={[
              { value: "ACTIVE", label: "Active" },
              { value: "INACTIVE", label: "Inactive" },
            ]}
            allowDeselect={false}
            {...form.getInputProps("status")}
          />
          <Group justify="flex-end" mt="sm">
            <Button variant="default" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" loading={submitting}>
              {client ? "Save changes" : "Add client"}
            </Button>
          </Group>
        </Stack>
      </form>
    </Modal>
  );
}
