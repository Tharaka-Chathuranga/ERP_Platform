import { Fragment, type ReactNode } from "react";
import { Box, Group, Text } from "@mantine/core";
import { IconCheck, IconClipboardList, IconHourglass, IconPackageExport, IconX } from "@tabler/icons-react";
import type { IssueStatus } from "@core/types";

const ACTIVE_STEP: Record<IssueStatus, number> = {
  DRAFT: 0,
  PENDING_APPROVAL: 1,
  APPROVED: 2,
  ISSUED: 4,
  RETURNED: 4,
  REJECTED: 1,
};

interface Step {
  label: string;
  icon: ReactNode;
  danger?: boolean;
}

export function IssueProgress({ status, ...rest }: { status: IssueStatus } & Record<string, unknown>) {
  const active = ACTIVE_STEP[status];
  const rejected = status === "REJECTED";

  const steps: Step[] = [
    { label: "Issue Request", icon: <IconClipboardList size={16} /> },
    {
      label: rejected ? "Rejected" : "Pending Approval",
      icon: rejected ? <IconX size={16} /> : <IconHourglass size={16} />,
      danger: rejected,
    },
    { label: "Approved", icon: <IconCheck size={16} /> },
    { label: status === "RETURNED" ? "Returned" : "Issued", icon: <IconPackageExport size={16} /> },
  ];

  // The furthest-reached step keeps its label on mobile so the stage is always readable.
  const current = Math.min(active, steps.length - 1);

  return (
    <Group gap={0} wrap="nowrap" style={{ overflowX: "auto" }} {...rest}>
      {steps.map((step, i) => {
        const reached = i <= active;
        const completed = !step.danger && i < active;
        const filled = step.danger || reached;
        const bg = step.danger
          ? "var(--mantine-color-red-6)"
          : reached
            ? "var(--mantine-color-green-6)"
            : "var(--mantine-color-gray-1)";

        return (
          <Fragment key={step.label}>
            <Box
              style={{
                position: "relative",
                display: "flex",
                alignItems: "center",
                gap: 8,
                padding: "8px 16px",
                borderRadius: 999,
                flexShrink: 0,
                whiteSpace: "nowrap",
                backgroundColor: bg,
                color: filled ? "white" : "var(--mantine-color-gray-6)",
              }}
            >
              {step.icon}
              <Text
                size="sm"
                fw={600}
                style={{ color: "inherit" }}
                visibleFrom={i === current ? undefined : "sm"}
              >
                {step.label}
              </Text>

              {completed && (
                <Box
                  style={{
                    position: "absolute",
                    top: -5,
                    right: -5,
                    width: 18,
                    height: 18,
                    borderRadius: "50%",
                    backgroundColor: "var(--mantine-color-green-7)",
                    border: "2px solid var(--mantine-color-body)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "white",
                  }}
                >
                  <IconCheck size={10} stroke={3} />
                </Box>
              )}
            </Box>

            {i < steps.length - 1 && (
              <Box
                style={{
                  flex: 1,
                  height: 2,
                  minWidth: 16,
                  backgroundColor:
                    i < active
                      ? "var(--mantine-color-green-4)"
                      : "var(--mantine-color-gray-3)",
                }}
              />
            )}
          </Fragment>
        );
      })}
    </Group>
  );
}
