import { Button, Group, Modal, Select, Stack, TextInput, Textarea } from "@mantine/core";
import { useForm } from "@mantine/form";
import { useEffect } from "react";
import type { OilMartSupplier } from "@core/types";
import type { SaveOilMartSupplierInput } from "../../api";

interface SupplierFormModalProps {
  opened: boolean;
  supplier?: OilMartSupplier;
  submitting?: boolean;
  onClose: () => void;
  onSubmit: (values: SaveOilMartSupplierInput) => void;
}

const EMPTY: SaveOilMartSupplierInput = {
  code: "",
  name: "",
  contactPerson: "",
  phone: "",
  email: "",
  address: "",
  status: "ACTIVE",
};

export function SupplierFormModal({
  opened,
  supplier,
  submitting,
  onClose,
  onSubmit,
}: SupplierFormModalProps) {
  const form = useForm<SaveOilMartSupplierInput>({
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
      supplier
        ? {
            code: supplier.code,
            name: supplier.name,
            contactPerson: supplier.contactPerson ?? "",
            phone: supplier.phone ?? "",
            email: supplier.email ?? "",
            address: supplier.address ?? "",
            status: supplier.status,
          }
        : EMPTY,
    );
  }, [opened, supplier]);

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={supplier ? "Edit supplier" : "Add supplier"}
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
              {supplier ? "Save changes" : "Add supplier"}
            </Button>
          </Group>
        </Stack>
      </form>
    </Modal>
  );
}
