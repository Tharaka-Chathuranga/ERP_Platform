import { useState } from "react";
import { Button, Group, Modal, Stack, Textarea } from "@mantine/core";

interface NoteModalProps {
  opened: boolean;
  onClose: () => void;
  title: string;
  label: string;
  confirmLabel: string;
  confirmColor?: string;
  submitting: boolean;
  onSubmit: (note: string) => void;
}

export function NoteModal({
  opened,
  onClose,
  title,
  label,
  confirmLabel,
  confirmColor,
  submitting,
  onSubmit,
}: NoteModalProps) {
  const [note, setNote] = useState("");
  const valid = note.trim().length > 0;

  return (
    <Modal opened={opened} onClose={onClose} title={title} centered>
      <Stack>
        <Textarea
          label={label}
          autosize
          minRows={3}
          value={note}
          onChange={(e) => setNote(e.currentTarget.value)}
        />
        <Group justify="flex-end">
          <Button variant="default" onClick={onClose}>Cancel</Button>
          <Button color={confirmColor} loading={submitting} disabled={!valid} onClick={() => onSubmit(note)}>
            {confirmLabel}
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
}
