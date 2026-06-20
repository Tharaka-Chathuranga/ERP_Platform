import { useState } from "react";
import { Button, Group, NumberInput, Stack, Text } from "@mantine/core";
import { IconCheck, IconChevronRight, IconX } from "@tabler/icons-react";
import type { IssueLine } from "@core/types";
import type { LineDecisionInput } from "./issuing.api";
import { IssueItemRow, LINE_TONE } from "./IssueItemRow";

type Choice = "APPROVED" | "REJECTED";

interface RowState {
  choice?: Choice;
  quantity: number | "";
}

interface IssueApprovalListProps {
  lines: IssueLine[];
  itemLabel: (itemId: string) => string;
  submitting?: boolean;
  onSubmit: (decisions: LineDecisionInput[]) => void;
}

export function IssueApprovalList({ lines, itemLabel, submitting, onSubmit }: IssueApprovalListProps) {
  const pending = lines.filter((l) => l.approvalStatus === "PENDING");

  const [rows, setRows] = useState<Record<string, RowState>>(() =>
    Object.fromEntries(pending.map((l) => [l.id, { quantity: l.quantity }])),
  );

  const setChoice = (id: string, choice: Choice) =>
    setRows((prev) => ({ ...prev, [id]: { ...prev[id], choice } }));
  const setQuantity = (id: string, quantity: number | "") =>
    setRows((prev) => ({ ...prev, [id]: { ...prev[id], quantity } }));

  const allDecided = pending.every((l) => {
    const row = rows[l.id];
    if (!row?.choice) return false;
    return row.choice === "REJECTED" || (typeof row.quantity === "number" && row.quantity > 0);
  });

  const submit = () => {
    const decisions: LineDecisionInput[] = pending.map((l) => {
      const row = rows[l.id];
      const approve = row.choice === "APPROVED";
      return {
        lineId: l.id,
        approve,
        approvedQuantity: approve && typeof row.quantity === "number" ? row.quantity : undefined,
      };
    });
    onSubmit(decisions);
  };

  return (
    <Stack gap="sm">
      {lines.map((line) => {
        if (line.approvalStatus !== "PENDING") {
          return <IssueItemRow key={line.id} line={line} itemLabel={itemLabel} />;
        }

        const row = rows[line.id];
        const rejected = row?.choice === "REJECTED";

        return (
          <IssueItemRow
            key={line.id}
            line={line}
            itemLabel={itemLabel}
            tone={row?.choice ? LINE_TONE[row.choice] : undefined}
            subtitle={
              <Text size="sm" c="dimmed">
                Requested {line.quantity} · {line.returnable ? "Returnable" : "Non-returnable"}
              </Text>
            }
            trailing={
              <Group gap="sm" wrap="nowrap">
                <NumberInput
                  w={96}
                  min={1}
                  size="sm"
                  value={row?.quantity ?? ""}
                  disabled={rejected}
                  onChange={(v) => setQuantity(line.id, v === "" ? "" : Number(v))}
                  aria-label="Approved quantity"
                />
                <Button.Group>
                  <Button
                    size="sm"
                    px="sm"
                    color="green"
                    variant={row?.choice === "APPROVED" ? "filled" : "default"}
                    onClick={() => setChoice(line.id, "APPROVED")}
                    aria-label="Approve item"
                  >
                    <IconCheck size={16} />
                  </Button>
                  <Button
                    size="sm"
                    px="sm"
                    color="red"
                    variant={rejected ? "filled" : "default"}
                    onClick={() => setChoice(line.id, "REJECTED")}
                    aria-label="Reject item"
                  >
                    <IconX size={16} />
                  </Button>
                </Button.Group>
              </Group>
            }
          />
        );
      })}

      {pending.length > 0 && (
        <Group justify="flex-end" mt="sm">
          <Button
            rightSection={<IconChevronRight size={16} />}
            disabled={!allDecided}
            loading={submitting}
            onClick={submit}
          >
            Continue
          </Button>
        </Group>
      )}
    </Stack>
  );
}
