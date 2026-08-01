import { Fragment, type ReactNode } from "react";
import { Box, Group, Text } from "@mantine/core";
import {
  IconBan,
  IconCheck,
  IconClipboardList,
  IconFileDescription,
  IconGavel,
  IconReceipt,
  IconTruckDelivery,
  IconX,
} from "@tabler/icons-react";
import type { OilMartSaleStatus } from "@core/types";

const ACTIVE_STEP: Record<OilMartSaleStatus, number> = {
  QUOTATION: 0,
  ORDERED: 1,
  APPROVED: 2,
  REJECTED: 2,
  DISPATCHED: 3,
  INVOICED: 4,
  CANCELLED: 1,
};

interface Step {
  label: string;
  icon: ReactNode;
  danger?: boolean;
}

export function OilMartSaleProgress({
  status,
  ...rest
}: { status: OilMartSaleStatus } & Record<string, unknown>) {
  const active = ACTIVE_STEP[status];
  const rejected = status === "REJECTED";
  const cancelled = status === "CANCELLED";

  const steps: Step[] = [
    { label: "Quotation", icon: <IconFileDescription size={16} /> },
    {
      label: cancelled ? "Cancelled" : "Ordered",
      icon: cancelled ? <IconBan size={16} /> : <IconClipboardList size={16} />,
      danger: cancelled,
    },
    {
      label: rejected ? "Rejected" : "Approved",
      icon: rejected ? <IconX size={16} /> : <IconGavel size={16} />,
      danger: rejected,
    },
    { label: "Dispatched", icon: <IconTruckDelivery size={16} /> },
    { label: "Invoiced", icon: <IconReceipt size={16} /> },
  ];

  const current = Math.min(active, steps.length - 1);

  return (
    <Group gap={0} wrap="nowrap" style={{ overflowX: "auto" }} {...rest}>
      {steps.map((step, i) => {
        const reached = i <= active;
        const completed = !step.danger && i < active;
        const dimmed = cancelled && i > active;
        const filled = step.danger || (reached && !dimmed);
        const bg = step.danger
          ? cancelled
            ? "var(--mantine-color-dark-5)"
            : "var(--mantine-color-red-6)"
          : reached && !dimmed
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
                opacity: dimmed ? 0.55 : 1,
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
                    i < active && !cancelled
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
