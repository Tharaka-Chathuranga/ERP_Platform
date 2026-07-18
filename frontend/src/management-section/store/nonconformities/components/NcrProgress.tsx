import { Fragment, type ReactNode } from "react";
import { Box, Group, Text } from "@mantine/core";
import { IconCheck, IconClipboardList, IconGavel, IconHourglass, IconLock, IconX } from "@tabler/icons-react";
import type { NonconformityStatus } from "@core/types";

const ACTIVE_STEP: Record<NonconformityStatus, number> = {
  RAISED: 0,
  UNDER_REVIEW: 1,
  DISPOSITIONED: 2,
  CLOSED: 3,
  REJECTED: 1,
};

interface Step {
  label: string;
  icon: ReactNode;
  danger?: boolean;
}

/** Horizontal pill stepper for the NCR lifecycle, mirroring the goods-issue progress bar. */
export function NcrProgress({ status, ...rest }: { status: NonconformityStatus } & Record<string, unknown>) {
  const active = ACTIVE_STEP[status];
  const rejected = status === "REJECTED";

  const steps: Step[] = [
    { label: "Raised", icon: <IconClipboardList size={16} /> },
    {
      label: rejected ? "Rejected" : "Under Review",
      icon: rejected ? <IconX size={16} /> : <IconHourglass size={16} />,
      danger: rejected,
    },
    { label: "Dispositioned", icon: <IconGavel size={16} /> },
    { label: "Closed", icon: <IconLock size={16} /> },
  ];

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
