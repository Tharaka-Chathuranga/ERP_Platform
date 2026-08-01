import { Button, Group, Modal, NumberInput, Select, Stack, TextInput, Textarea } from "@mantine/core";
import { useForm } from "@mantine/form";
import { useEffect } from "react";
import type { OilMartItem } from "@core/types";
import type { SaveOilMartItemInput } from "../../api";
import { OIL_TYPE_OPTIONS } from "../../../components/oil-type-badge";

interface ItemFormModalProps {
  opened: boolean;
  item?: OilMartItem;
  submitting?: boolean;
  onClose: () => void;
  onSubmit: (values: SaveOilMartItemInput) => void;
}

const EMPTY: SaveOilMartItemInput = {
  code: "",
  name: "",
  oilType: "ENGINE",
  brand: "",
  grade: "",
  description: "",
  reorderLevelLitres: 0,
  status: "ACTIVE",
};

export function ItemFormModal({ opened, item, submitting, onClose, onSubmit }: ItemFormModalProps) {
  const form = useForm<SaveOilMartItemInput>({
    initialValues: EMPTY,
    validate: {
      code: (value) => (value.trim() ? null : "Code is required"),
      name: (value) => (value.trim() ? null : "Name is required"),
      reorderLevelLitres: (value) => (value >= 0 ? null : "Reorder level cannot be negative"),
    },
  });

  useEffect(() => {
    if (!opened) return;
    form.setValues(
      item
        ? {
            code: item.code,
            name: item.name,
            oilType: item.oilType,
            brand: item.brand ?? "",
            grade: item.grade ?? "",
            description: item.description ?? "",
            reorderLevelLitres: item.reorderLevelLitres,
            status: item.status,
          }
        : EMPTY,
    );
    form.resetDirty();
  }, [opened, item]);

  return (
    <Modal opened={opened} onClose={onClose} title={item ? "Edit oil" : "Add oil"} centered>
      <form onSubmit={form.onSubmit(onSubmit)}>
        <Stack gap="sm">
          <TextInput label="Code" withAsterisk {...form.getInputProps("code")} />
          <TextInput label="Name" withAsterisk {...form.getInputProps("name")} />
          <Select
            label="Oil type"
            data={OIL_TYPE_OPTIONS}
            allowDeselect={false}
            {...form.getInputProps("oilType")}
          />
          <Group grow>
            <TextInput label="Brand" {...form.getInputProps("brand")} />
            <TextInput label="Grade" {...form.getInputProps("grade")} />
          </Group>
          <NumberInput
            label="Reorder level"
            suffix=" L"
            min={0}
            decimalScale={4}
            {...form.getInputProps("reorderLevelLitres")}
          />
          <Textarea label="Description" autosize minRows={2} {...form.getInputProps("description")} />
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
              {item ? "Save changes" : "Add oil"}
            </Button>
          </Group>
        </Stack>
      </form>
    </Modal>
  );
}
