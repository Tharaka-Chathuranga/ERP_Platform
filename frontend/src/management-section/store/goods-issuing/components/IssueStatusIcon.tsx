import { ThemeIcon, Tooltip } from "@mantine/core";
import {
  IconArrowBackUp,
  IconCheck,
  IconClipboardList,
  IconHourglass,
  IconPackageExport,
  IconX,
} from "@tabler/icons-react";
import type { ReactNode } from "react";
import type { IssueStatus } from "@core/types";

const STATUS_ICON: Record<IssueStatus, { icon: ReactNode; color: string; label: string }> = {
  DRAFT: { icon: <IconClipboardList size={16} />, color: "gray", label: "Draft" },
  PENDING_APPROVAL: { icon: <IconHourglass size={16} />, color: "yellow", label: "Pending approval" },
  APPROVED: { icon: <IconCheck size={16} />, color: "green", label: "Approved" },
  ISSUED: { icon: <IconPackageExport size={16} />, color: "blue", label: "Issued" },
  REJECTED: { icon: <IconX size={16} />, color: "red", label: "Rejected" },
  RETURNED: { icon: <IconArrowBackUp size={16} />, color: "teal", label: "Returned" },
};

export function IssueStatusIcon({ status, size = 30 }: { status: IssueStatus; size?: number }) {
  const meta = STATUS_ICON[status] ?? { icon: <IconClipboardList size={16} />, color: "gray", label: status };
  return (
    <Tooltip label={meta.label} withArrow>
      <ThemeIcon variant="light" color={meta.color} radius="xl" size={size} aria-label={meta.label}>
        {meta.icon}
      </ThemeIcon>
    </Tooltip>
  );
}
