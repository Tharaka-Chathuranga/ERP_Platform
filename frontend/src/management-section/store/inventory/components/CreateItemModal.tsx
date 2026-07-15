import { useState } from "react";
import {
  Button,
  Group,
  Modal,
  NumberInput,
  Select,
  Stack,
  TextInput,
} from "@mantine/core";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createItem } from "@store/inventory/items.api";
import { notifyError, notifySuccess } from "@core/notify";
import type { ValuationMethod } from "@core/types";

const VALUATION: { value: ValuationMethod; label: string }[] = [
  { value: "WEIGHTED_AVERAGE", label: "Weighted average" },
  { value: "FIFO", label: "FIFO" },
  { value: "STANDARD_COST", label: "Standard cost" },
];

export function CreateItemModal({ opened, onClose }: { opened: boolean; onClose: () => void }) {
  const qc = useQueryClient();
  const [itemCode, setItemCode] = useState("");
  const [name, setName] = useState("");
  const [unitOfMeasure, setUom] = useState("EACH");
  const [valuationMethod, setValuation] = useState<ValuationMethod>("WEIGHTED_AVERAGE");
  const [reorderLevel, setReorder] = useState<number | "">(0);
  const [category, setCategory] = useState("");

  const reset = () => {
    setItemCode("");
    setName("");
    setUom("EACH");
    setReorder(0);
    setCategory("");
  };

  const mutation = useMutation({
    mutationFn: () =>
      createItem({
        itemCode,
        name,
        unitOfMeasure,
        valuationMethod,
        reorderLevel: Number(reorderLevel || 0),
        category: category || undefined,
      }),
    onSuccess: () => {
      notifySuccess("Item created");
      qc.invalidateQueries({ queryKey: ["items"] });
      reset();
      onClose();
    },
    onError: notifyError,
  });

  return (
    <Modal opened={opened} onClose={onClose} title="New item" centered>
      <Stack>
        <Group grow>
          <TextInput
            label="Item code"
            value={itemCode}
            onChange={(e) => setItemCode(e.currentTarget.value)}
            required
          />
          <TextInput
            label="Unit of measure"
            value={unitOfMeasure}
            onChange={(e) => setUom(e.currentTarget.value)}
            required
          />
        </Group>
        <TextInput
          label="Name"
          value={name}
          onChange={(e) => setName(e.currentTarget.value)}
          required
        />
        <Group grow>
          <Select
            label="Valuation method"
            data={VALUATION}
            value={valuationMethod}
            onChange={(v) => setValuation((v as ValuationMethod) ?? "WEIGHTED_AVERAGE")}
            allowDeselect={false}
          />
          <NumberInput
            label="Reorder level"
            min={0}
            value={reorderLevel}
            onChange={(v) => setReorder(v === "" ? "" : Number(v))}
          />
        </Group>
        <TextInput
          label="Category"
          value={category}
          onChange={(e) => setCategory(e.currentTarget.value)}
        />
        <Group justify="flex-end">
          <Button variant="default" onClick={onClose}>
            Cancel
          </Button>
          <Button
            loading={mutation.isPending}
            disabled={!itemCode || !name || !unitOfMeasure}
            onClick={() => mutation.mutate()}
          >
            Create
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
}
