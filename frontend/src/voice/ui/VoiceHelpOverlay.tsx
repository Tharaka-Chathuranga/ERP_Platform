import { Badge, Code, Group, Modal, Stack, Text } from "@mantine/core";
import { useVoice } from "../react/VoiceContext";

/**
 * "What can I say?" overlay listing the commands currently available to the user
 * (global + page-contextual, already permission-filtered). Read-only help.
 */
export function VoiceHelpOverlay({ opened, onClose }: { opened: boolean; onClose: () => void }) {
  const { listAvailableCommands } = useVoice();
  const commands = opened ? listAvailableCommands() : [];

  return (
    <Modal opened={opened} onClose={onClose} title="Voice commands" size="lg">
      <Stack gap="sm">
        <Text size="sm" c="dimmed">
          Say one of these. Words in braces are values you provide, e.g. a quantity or name.
        </Text>
        {commands.map((command) => (
          <Group key={command.id} justify="space-between" wrap="nowrap" align="flex-start">
            <div>
              <Text size="sm" fw={600}>
                {command.title}
              </Text>
              <Code>{command.patterns[0]}</Code>
            </div>
            {command.mutating ? <Badge color="yellow" variant="light">needs confirm</Badge> : null}
          </Group>
        ))}
        {commands.length === 0 ? <Text size="sm">No commands available.</Text> : null}
      </Stack>
    </Modal>
  );
}
