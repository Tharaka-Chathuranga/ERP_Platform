import { useState } from "react";
import { Box, Button, Card, Divider, Group, Paper, SimpleGrid, Stack, Text, Textarea, ThemeIcon } from "@mantine/core";
import React from "react";
import { IconCheck, IconChevronLeft, IconChevronRight, IconCircleCheck, IconPackageImport, IconProgress } from "@tabler/icons-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { PageHeader } from "@ui/layout/PageHeader";
import { LineItemsEditor, newLine, type EditableLine } from "@ui/primitives/LineItemsEditor";
import { UserSelect } from "@ui/primitives/UserSelect";
import { useAuth } from "@auth/AuthContext";
import { createDeviation } from "@store/defects/deviations.api";
import { notifyError, notifySuccess } from "@core/notify";
import type { DeviationStage } from "@core/types";

const STAGE_OPTIONS: { label: string; value: DeviationStage; icon: React.ReactNode }[] = [
  { label: "Incoming", value: "INCOMING", icon: <IconPackageImport size={28} /> },
  { label: "In progress", value: "IN_PROGRESS", icon: <IconProgress size={28} /> },
  { label: "Final", value: "FINAL", icon: <IconCircleCheck size={28} /> },
];

function StepHeading({ number, title }: { number: number; title: string }) {
  return (
    <Group gap="sm" mb="md">
      <Box
        style={{
          width: 32, height: 32, borderRadius: "50%",
          border: "2px solid var(--mantine-color-brand-5)",
          display: "flex", alignItems: "center", justifyContent: "center",
          flexShrink: 0,
        }}
      >
        <Text size="sm" fw={700} c="brand">{number}</Text>
      </Box>
      <Text size="md" fw={600}>{title}</Text>
    </Group>
  );
}

export function NewDeviationPage() {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const { userId } = useAuth();

  const [stage, setStage] = useState<DeviationStage>("INCOMING");
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [reason, setReason] = useState("");
  const [lines, setLines] = useState<EditableLine[]>([newLine()]);

  const isFinal = stage === "FINAL";
  const requestedByUserId = isFinal ? selectedUserId : userId;

  const validLines = lines.filter((l) => l.itemId && l.quantity !== "" && Number(l.quantity) > 0);
  const canSubmit = !!requestedByUserId && validLines.length > 0;

  const mutation = useMutation({
    mutationFn: () =>
      createDeviation({
        stage,
        reason: reason || undefined,
        requestedByUserId: requestedByUserId!,
        items: validLines.map((l) => ({ itemId: l.itemId!, quantity: Number(l.quantity) })),
      }),
    onSuccess: (d) => {
      notifySuccess("Defect report created");
      qc.invalidateQueries({ queryKey: ["deviations"] });
      navigate(`/defects/${d.id}`);
    },
    onError: notifyError,
  });

  return (
    <div>
      <PageHeader title="Report defect" />

      <Group mb="md">
        <Button variant="default" leftSection={<IconChevronLeft size={16} />} onClick={() => navigate("/defects")}>
          Back
        </Button>
      </Group>

      <Card withBorder radius="md" padding={0}>

        {/* Step 1 — Stage */}
        <Box p="xl">
          <StepHeading number={1} title="What stage is this defect report?" />
          <SimpleGrid cols={3}>
            {STAGE_OPTIONS.map((o) => {
              const selected = stage === o.value;
              return (
                <Paper
                  key={o.value}
                  withBorder
                  radius="lg"
                  p="xl"
                  onClick={() => { setStage(o.value); setSelectedUserId(null); }}
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
                    <ThemeIcon
                      size={64}
                      radius="xl"
                      variant={selected ? "light" : "light"}
                      color={selected ? "green" : "gray"}
                    >
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

        {/* Step 2 — Reporter (only for Final) */}
        {isFinal && (
          <>
            <Divider />
            <Box p="xl">
              <StepHeading number={2} title="Who raised this defect?" />
              <UserSelect
                placeholder="Select the user who raised this defect"
                value={selectedUserId}
                onChange={setSelectedUserId}
              />
            </Box>
          </>
        )}

        {/* Step 3 — Items */}
        <Divider />
        <Box p="xl">
          <StepHeading number={isFinal ? 3 : 2} title="Which items are affected?" />
          <LineItemsEditor lines={lines} onChange={setLines} />
        </Box>

        {/* Step 4 — Reason */}
        <Divider />
        <Box p="xl">
          <StepHeading number={isFinal ? 4 : 3} title="What is the reason for this defect?" />
          <Textarea
            placeholder="e.g. Items arrived damaged, wrong batch, incorrect quantity…"
            autosize
            minRows={3}
            value={reason}
            onChange={(e) => setReason(e.currentTarget.value)}
          />
        </Box>

        {/* Submit */}
        <Divider />
        <Box p="xl">
          <Group justify="flex-end">
            <Button
              radius="xl"
              rightSection={<IconChevronRight size={16} />}
              onClick={() => mutation.mutate()}
              loading={mutation.isPending}
              disabled={!canSubmit}
            >
              Submit report
            </Button>
          </Group>
        </Box>

      </Card>
    </div>
  );
}
