import type { ReactNode } from "react";
import { Box, Group, Text, ThemeIcon } from "@mantine/core";
import { IconBox } from "@tabler/icons-react";
import { StatusBadge } from "@ui/feedback/StatusBadge";
import type { IssueLine, IssueLineStatus } from "@core/types";

export const LINE_TONE: Record<IssueLineStatus, { color: string; border: string; bg: string }> = {
  APPROVED: { color: "green", border: "var(--mantine-color-green-3)", bg: "var(--mantine-color-green-light)" },
  REJECTED: { color: "red", border: "var(--mantine-color-red-3)", bg: "var(--mantine-color-red-light)" },
  PENDING: { color: "gray", border: "var(--mantine-color-gray-3)", bg: "transparent" },
};

interface IssueItemRowProps {
  line: IssueLine;
  itemLabel: (itemId: string) => string;
  /** Optional right-hand content; defaults to the line's status badge. */
  trailing?: ReactNode;
  /** Override the status-derived colour tone (e.g. to preview a staged decision). */
  tone?: { color: string; border: string; bg: string };
  /** Override the default "Qty …"/"Rejected" subtitle line. */
  subtitle?: ReactNode;
}

/** One issue line rendered as a status-toned row. Shared by the read-only list and the approval list. */
export function IssueItemRow({ line, itemLabel, trailing, tone: toneOverride, subtitle }: IssueItemRowProps) {
  const tone = toneOverride ?? LINE_TONE[line.approvalStatus];
  const rejected = line.approvalStatus === "REJECTED";

  return (
    <Group
      wrap="nowrap"
      justify="space-between"
      p="md"
      style={{
        border: `1px solid ${tone.border}`,
        borderRadius: "var(--mantine-radius-md)",
        backgroundColor: tone.bg,
      }}
    >
      <Group gap="sm" wrap="nowrap" style={{ minWidth: 0 }}>
        <ThemeIcon size={36} radius="md" variant="light" color={tone.color}>
          <IconBox size={20} />
        </ThemeIcon>
        <Box style={{ minWidth: 0 }}>
          <Text fw={600} lineClamp={1}>
            {itemLabel(line.itemId)}
          </Text>
          {subtitle ??
            (rejected ? (
              <Text size="sm" c="red.7" fw={500}>
                Rejected — not issued
              </Text>
            ) : (
              <Text size="sm" c="dimmed">
                Qty {line.quantity} · {line.returnable ? "Returnable" : "Non-returnable"}
                {line.returnedQuantity > 0 && ` · Returned ${line.returnedQuantity}`}
              </Text>
            ))}
        </Box>
      </Group>

      {trailing ?? <StatusBadge status={line.approvalStatus} />}
    </Group>
  );
}
