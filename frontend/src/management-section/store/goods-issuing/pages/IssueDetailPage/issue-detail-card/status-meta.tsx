import type { ReactNode } from "react";
import {
  IconArrowBackUp,
  IconCheck,
  IconClipboardList,
  IconHourglass,
  IconPackageExport,
  IconX,
} from "@tabler/icons-react";
import type { IssueStatus } from "@core/types";

interface StatusMeta {
  label: string;
  bg: string;
  border: string;
  badge: string;
  icon: ReactNode;
  iconColor: string;
}

export const STATUS_META: Record<IssueStatus, StatusMeta> = {
  DRAFT:            { label: "Draft",            bg: "var(--mantine-color-gray-light)",   border: "var(--mantine-color-gray-5)",   badge: "gray",   icon: <IconClipboardList size={28} />, iconColor: "gray"   },
  PENDING_APPROVAL: { label: "Pending approval", bg: "var(--mantine-color-yellow-light)", border: "var(--mantine-color-yellow-5)", badge: "yellow", icon: <IconHourglass size={28} />,     iconColor: "yellow" },
  APPROVED:         { label: "Approved",         bg: "var(--mantine-color-green-light)",  border: "var(--mantine-color-green-5)",  badge: "green",  icon: <IconCheck size={28} />,         iconColor: "green"  },
  ISSUED:           { label: "Issued",           bg: "var(--mantine-color-blue-light)",   border: "var(--mantine-color-blue-5)",   badge: "blue",   icon: <IconPackageExport size={28} />, iconColor: "blue"   },
  REJECTED:         { label: "Rejected",         bg: "var(--mantine-color-red-light)",    border: "var(--mantine-color-red-5)",    badge: "red",    icon: <IconX size={28} />,             iconColor: "red"    },
  RETURNED:         { label: "Returned",         bg: "var(--mantine-color-teal-light)",   border: "var(--mantine-color-teal-5)",   badge: "teal",   icon: <IconArrowBackUp size={28} />,   iconColor: "teal"   },
};
