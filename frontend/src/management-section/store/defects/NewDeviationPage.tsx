import { useState } from "react";
import { Box, Button, Card, Group, Paper, Stack, Text, Textarea, ThemeIcon, Title } from "@mantine/core";
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
        <Button
          variant="default"
          leftSection={<IconChevronLeft size={16} />}
          onClick={() => navigate("/defects")}
        >
          Back
        </Button>
      </Group>

      <Card withBorder radius="md" padding="lg">
        <Stack gap="lg">
          <Title order={4}>New Defect Report</Title>

          <div>
            <Text size="sm" fw={500} mb="xs">Stage</Text>
            <Group grow>
              {STAGE_OPTIONS.map((o) => {
                const selected = stage === o.value;
                return (
                  <Paper
                    key={o.value}
                    withBorder
                    radius="md"
                    p="md"
                    onClick={() => { setStage(o.value); setSelectedUserId(null); }}
                    style={{
                      cursor: "pointer",
                      position: "relative",
                      borderColor: selected ? "var(--mantine-color-green-6)" : undefined,
                      backgroundColor: selected ? "var(--mantine-color-green-light)" : undefined,
                    }}
                  >
                    {selected && (
                      <Box style={{ position: "absolute", top: 8, right: 8 }}>
                        <ThemeIcon color="green" size={20} radius="xl">
                          <IconCheck size={12} />
                        </ThemeIcon>
                      </Box>
                    )}
                    <Stack align="center" gap={6}>
                      <Text c={selected ? "green" : "dimmed"}>{o.icon}</Text>
                      <Text size="sm" fw={selected ? 600 : 400} c={selected ? "green" : undefined}>
                        {o.label}
                      </Text>
                    </Stack>
                  </Paper>
                );
              })}
            </Group>
          </div>

          {isFinal && (
            <UserSelect
              label="Requested by"
              placeholder="Select the user who raised this defect"
              value={selectedUserId}
              onChange={setSelectedUserId}
            />
          )}

          <LineItemsEditor lines={lines} onChange={setLines} />

          <Textarea
            label="Reason"
            placeholder="e.g. Items arrived damaged, wrong batch, incorrect quantity..."
            autosize
            minRows={3}
            value={reason}
            onChange={(e) => setReason(e.currentTarget.value)}
          />

          <Group justify="flex-end">
            <Button
              radius="md"
              rightSection={<IconChevronRight size={16} />}
              onClick={() => mutation.mutate()}
              loading={mutation.isPending}
              disabled={!canSubmit}
            >
              Submit report
            </Button>
          </Group>
        </Stack>
      </Card>
    </div>
  );
}
