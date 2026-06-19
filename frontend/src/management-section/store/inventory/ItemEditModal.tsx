import { useState } from "react";
import { Button, Group, Modal, NumberInput, Stack, Switch, TextInput, Textarea } from "@mantine/core";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { qk } from "@core/queryKeys";
import { notifyError, notifySuccess } from "@core/notify";
import type { Item } from "@core/types";
import { updateItem } from "./items.api";

interface ItemEditModalProps {
  /** The item to edit; the modal is open while this is non-null. */
  item: Item | null;
  onClose: () => void;
}

/** Edits an item's master-data fields (code, price and on-hand are not editable here). */
export function ItemEditModal({ item, onClose }: ItemEditModalProps) {
  const qc = useQueryClient();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [reorderLevel, setReorder] = useState<number | "">(0);
  const [criticalItem, setCritical] = useState(false);
  const [approvalRequiredForIssue, setApproval] = useState(false);

  // Sync local form state whenever a different item is opened.
  const [loadedId, setLoadedId] = useState<string | null>(null);
  if (item && item.id !== loadedId) {
    setLoadedId(item.id);
    setName(item.name);
    setDescription(item.description ?? "");
    setCategory(item.category ?? "");
    setReorder(item.reorderLevel);
    setCritical(item.criticalItem);
    setApproval(item.approvalRequiredForIssue);
  }

  const mutation = useMutation({
    mutationFn: () =>
      updateItem(item!.id, {
        name,
        description: description || undefined,
        category: category || undefined,
        reorderLevel: Number(reorderLevel || 0),
        criticalItem,
        approvalRequiredForIssue,
      }),
    onSuccess: () => {
      notifySuccess("Item updated");
      qc.invalidateQueries({ queryKey: ["items"] });
      qc.invalidateQueries({ queryKey: qk.lowStock() });
      qc.invalidateQueries({ queryKey: qk.adminSummary() });
      onClose();
    },
    onError: notifyError,
  });

  return (
    <Modal opened={!!item} onClose={onClose} title={item ? `Edit ${item.itemCode}` : "Edit item"} centered>
      <Stack>
        <TextInput label="Name" value={name} onChange={(e) => setName(e.currentTarget.value)} required />
        <Textarea
          label="Description"
          autosize
          minRows={2}
          value={description}
          onChange={(e) => setDescription(e.currentTarget.value)}
        />
        <Group grow>
          <TextInput label="Category" value={category} onChange={(e) => setCategory(e.currentTarget.value)} />
          <NumberInput
            label="Reorder level"
            min={0}
            value={reorderLevel}
            onChange={(v) => setReorder(v === "" ? "" : Number(v))}
          />
        </Group>
        <Switch
          label="Critical item"
          checked={criticalItem}
          onChange={(e) => setCritical(e.currentTarget.checked)}
        />
        <Switch
          label="Approval required for issue"
          checked={approvalRequiredForIssue}
          onChange={(e) => setApproval(e.currentTarget.checked)}
        />
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
