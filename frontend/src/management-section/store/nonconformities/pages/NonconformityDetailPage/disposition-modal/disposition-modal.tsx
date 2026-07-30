import { useState } from "react";
import { Button, Group, Modal, Select, Stack, Textarea } from "@mantine/core";
import type { DispositionType } from "@core/types";
import { DISPOSITION_OPTIONS } from "../../../components";

interface DispositionModalProps {
  opened: boolean;
  onClose: () => void;
  submitting: boolean;
  onSubmit: (type: DispositionType, note: string) => void;
}

export function DispositionModal({ opened, onClose, submitting, onSubmit }: DispositionModalProps) {
  const [type, setType] = useState<DispositionType | null>(null);
  const [note, setNote] = useState("");
  const valid = !!type && note.trim().length > 0;

  return (
    <Modal opened={opened} onClose={onClose} title="Record disposition" centered>
      <Stack>
        <Select
          label="Disposition"
          placeholder="Select a disposition"
          data={DISPOSITION_OPTIONS}
          value={type}
          onChange={(v) => setType(v as DispositionType | null)}
          comboboxProps={{ withinPortal: true }}
        />
        <Textarea
          label="Decision note"
          description="Recorded as the deciding authority's rationale (ISO 8.7.2)"
          autosize
          minRows={3}
          value={note}
          onChange={(e) => setNote(e.currentTarget.value)}
        />
        <Group justify="flex-end">
          <Button variant="default" onClick={onClose}>Cancel</Button>
          <Button color="green" loading={submitting} disabled={!valid} onClick={() => type && onSubmit(type, note)}>
            Record disposition
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
}
