import { Box, Button, Card, Divider, Group, Paper, SimpleGrid, Stack, Text, Textarea, ThemeIcon } from "@mantine/core";
import React from "react";
import { IconCheck, IconChevronRight, IconCircleCheck, IconPackageImport, IconProgress } from "@tabler/icons-react";
import { StepHeading } from "@ui/layout/StepHeading";
import { LineItemsEditor } from "@ui/primitives/LineItemsEditor";
import { UserSelect } from "@ui/primitives/UserSelect";
import type { DetectionStage } from "@core/types";
import { useNewNonconformity } from "../hooks/use-new-nonconformity";

const STAGE_OPTIONS: { label: string; value: DetectionStage; icon: React.ReactNode }[] = [
  { label: "Incoming", value: "INCOMING", icon: <IconPackageImport size={28} /> },
  { label: "In progress", value: "IN_PROGRESS", icon: <IconProgress size={28} /> },
  { label: "Final", value: "FINAL", icon: <IconCircleCheck size={28} /> },
];

export function NewNonconformityForm() {
  const {
    detectionStage,
    selectStage,
    selectedUserId,
    setSelectedUserId,
    description,
    setDescription,
    lines,
    setLines,
    isFinal,
    canSubmit,
    mutation,
  } = useNewNonconformity();

  return (
    <Card withBorder radius="md" padding={0}>
      <Box p="xl">
        <StepHeading number={1} title="Where was this nonconformity detected?" />
        <SimpleGrid cols={3}>
          {STAGE_OPTIONS.map((o) => {
            const selected = detectionStage === o.value;
            return (
              <Paper
                key={o.value}
                withBorder
                radius="lg"
                p="xl"
                onClick={() => selectStage(o.value)}
                style={{
                  cursor: "pointer",
                  position: "relative",
                  textAlign: "center",
                  borderColor: selected ? "var(--mantine-color-green-6)" : "var(--mantine-color-default-border)",
                  borderWidth: selected ? 2 : 1,
                  backgroundColor: selected ? "var(--mantine-color-green-light)" : undefined,
                  transition: "border-color 0.15s, background-color 0.15s",
                }}
              >
                {selected && (
                  <Box style={{ position: "absolute", top: 10, right: 10 }}>
                    <ThemeIcon color="green" size={22} radius="xl">
                      <IconCheck size={13} />
                    </ThemeIcon>
                  </Box>
                )}
                <Stack align="center" gap="sm">
                  <ThemeIcon size={64} radius="xl" variant="light" color={selected ? "green" : "gray"}>
                    {o.icon}
                  </ThemeIcon>
                  <Text size="sm" fw={600} c={selected ? "green" : "dimmed"}>
                    {o.label}
                  </Text>
                </Stack>
              </Paper>
            );
          })}
        </SimpleGrid>
      </Box>

      {isFinal && (
        <>
          <Divider />
          <Box p="xl">
            <StepHeading number={2} title="Who raised this nonconformity?" />
            <UserSelect
              placeholder="Select the user who raised this nonconformity"
              value={selectedUserId}
              onChange={setSelectedUserId}
            />
          </Box>
        </>
      )}

      <Divider />
      <Box p="xl">
        <StepHeading number={isFinal ? 3 : 2} title="Which items are affected?" />
        <LineItemsEditor lines={lines} onChange={setLines} />
      </Box>

      <Divider />
      <Box p="xl">
        <StepHeading number={isFinal ? 4 : 3} title="Describe the nonconformity" />
        <Textarea
          placeholder="e.g. Items arrived damaged, wrong batch, incorrect quantity…"
          autosize
          minRows={3}
          value={description}
          onChange={(e) => setDescription(e.currentTarget.value)}
        />
      </Box>

      <Box p="xl" pt={0}>
        <Group justify="flex-end">
          <Button
            radius="md"
            rightSection={<IconChevronRight size={16} />}
            onClick={() => mutation.mutate()}
            loading={mutation.isPending}
            disabled={!canSubmit}
          >
            Raise report
          </Button>
        </Group>
      </Box>
    </Card>
  );
}
