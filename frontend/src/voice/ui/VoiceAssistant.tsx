import { useEffect, useState } from "react";
import { ActionIcon, Affix, Group, Paper, Stack, Text, Tooltip, Transition } from "@mantine/core";
import { IconHelpCircle, IconPlayerStopFilled, IconX } from "@tabler/icons-react";
import { useVoice } from "../react/VoiceContext";
import type { AssistantPhase } from "../react/VoiceContext";
import { AssistantOrb } from "./AssistantOrb";
import { VoiceConfirmBanner } from "./VoiceConfirmBanner";
import { VoiceHelpOverlay } from "./VoiceHelpOverlay";

const PHASE_LABEL: Record<AssistantPhase, string> = {
  idle: "Assistant",
  loading: "Preparing voice…",
  listening: "Listening…",
  processing: "Thinking…",
  speaking: "Speaking…",
  error: "Voice error",
};

export function VoiceAssistant() {
  const voice = useVoice();
  const [helpOpened, setHelpOpened] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  const active = voice.phase !== "idle";

  // A new interaction (listening / a pending confirmation) un-dismisses the panel.
  useEffect(() => {
    if (voice.isListening || voice.pendingConfirmation !== null) setDismissed(false);
  }, [voice.isListening, voice.pendingConfirmation]);

  const panelVisible =
    !dismissed &&
    (voice.greeting !== null ||
      active ||
      voice.pendingConfirmation !== null ||
      voice.partialTranscript.length > 0);

  const orbLabel = voice.isListening ? "Stop voice control" : "Start voice control";

  const handleClose = () => {
    if (voice.isListening) voice.stop();
    setDismissed(true);
  };

  return (
    <>
      <Affix position={{ bottom: 24, right: 24 }}>
        <Stack gap="sm" align="flex-end">
          <Transition transition="pop-bottom-right" mounted={panelVisible}>
            {(styles) => (
              <Paper
                style={{ ...styles, width: 320 }}
                withBorder
                shadow="lg"
                radius="lg"
                p="md"
                role="status"
                aria-live="polite"
              >
                <Stack gap="xs">
                  <Group justify="space-between" wrap="nowrap">
                    <Text size="sm" fw={700}>
                      {PHASE_LABEL[voice.phase]}
                    </Text>
                    <Group gap={4} wrap="nowrap">
                      {active ? (
                        <Tooltip label="Stop" withArrow>
                          <ActionIcon
                            variant="light"
                            color="red"
                            size="sm"
                            aria-label="Stop voice control"
                            onClick={voice.stop}
                          >
                            <IconPlayerStopFilled size={14} />
                          </ActionIcon>
                        </Tooltip>
                      ) : null}
                      <Tooltip label="What can I say?" withArrow>
                        <ActionIcon
                          variant="subtle"
                          size="sm"
                          aria-label="Show voice commands"
                          onClick={() => setHelpOpened(true)}
                        >
                          <IconHelpCircle size={16} />
                        </ActionIcon>
                      </Tooltip>
                      <Tooltip label="Close" withArrow>
                        <ActionIcon
                          variant="subtle"
                          color="gray"
                          size="sm"
                          aria-label="Close assistant panel"
                          onClick={handleClose}
                        >
                          <IconX size={16} />
                        </ActionIcon>
                      </Tooltip>
                    </Group>
                  </Group>

                  {voice.greeting ? <Text size="sm">{voice.greeting}</Text> : null}

                  {voice.partialTranscript ? (
                    <Text size="sm" fs="italic" c="dimmed">
                      “{voice.partialTranscript}”
                    </Text>
                  ) : null}

                  {voice.errorMessage ? (
                    <Text size="sm" c="red">
                      {voice.errorMessage}
                    </Text>
                  ) : null}

                  {!voice.pendingConfirmation && voice.lastCommandTitle ? (
                    <Text size="xs" c="dimmed">
                      Last: {voice.lastCommandTitle}
                    </Text>
                  ) : null}

                  <VoiceConfirmBanner />
                </Stack>
              </Paper>
            )}
          </Transition>

          <AssistantOrb phase={voice.phase} onClick={voice.toggle} label={orbLabel} />
        </Stack>
      </Affix>

      <VoiceHelpOverlay opened={helpOpened} onClose={() => setHelpOpened(false)} />
    </>
  );
}
