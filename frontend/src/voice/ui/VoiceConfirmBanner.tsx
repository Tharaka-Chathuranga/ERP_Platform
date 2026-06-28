import { Button, Group, Paper, Stack, Text } from "@mantine/core";
import { IconAlertCircle } from "@tabler/icons-react";
import { useVoice } from "../react/VoiceContext";


export function VoiceConfirmBanner() {
  const { pendingConfirmation, confirmPending, cancelPending } = useVoice();
  if (!pendingConfirmation) return null;

  return (
    <Paper withBorder shadow="md" radius="md" p="md" bg="var(--mantine-color-yellow-light)">
      <Stack gap="xs">
        <Group gap="xs" wrap="nowrap">
          <IconAlertCircle size={18} />
          <Text size="sm" fw={600}>
            Confirm action
          </Text>
        </Group>
        <Text size="sm">{pendingConfirmation.description}</Text>
        <Group gap="xs" justify="flex-end">
          <Button size="xs" variant="default" onClick={cancelPending}>
            Cancel
          </Button>
          <Button size="xs" color="teal" onClick={confirmPending}>
            Confirm
          </Button>
        </Group>
        <Text size="xs" c="dimmed">
          Or say “confirm” / “cancel”.
        </Text>
      </Stack>
    </Paper>
  );
}
