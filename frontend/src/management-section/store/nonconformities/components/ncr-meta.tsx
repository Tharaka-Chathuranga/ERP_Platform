import type { ReactNode } from "react";
import {
  IconCheck,
  IconCircleCheck,
  IconClipboardList,
  IconHourglass,
  IconLock,
  IconPackageImport,
  IconProgress,
  IconX,
} from "@tabler/icons-react";
import type { DetectionStage, DispositionType, NonconformityStatus } from "@core/types";

export interface StatusMeta {
  label: string;
  bg: string;
  border: string;
  badge: string;
  iconColor: string;
  icon: ReactNode;
}

/** Coloured header / badge / floating-icon metadata per NCR status. */
export const STATUS_META: Record<NonconformityStatus, StatusMeta> = {
  RAISED:        { label: "Raised",        bg: "var(--mantine-color-yellow-light)", border: "var(--mantine-color-yellow-5)", badge: "yellow", iconColor: "yellow", icon: <IconClipboardList size={28} /> },
  UNDER_REVIEW:  { label: "Under review",  bg: "var(--mantine-color-blue-light)",   border: "var(--mantine-color-blue-5)",   badge: "blue",   iconColor: "blue",   icon: <IconHourglass size={28} /> },
  DISPOSITIONED: { label: "Dispositioned", bg: "var(--mantine-color-green-light)",  border: "var(--mantine-color-green-5)",  badge: "green",  iconColor: "green",  icon: <IconCheck size={28} /> },
  REJECTED:      { label: "Rejected",      bg: "var(--mantine-color-red-light)",    border: "var(--mantine-color-red-5)",    badge: "red",    iconColor: "red",    icon: <IconX size={28} /> },
  CLOSED:        { label: "Closed",        bg: "var(--mantine-color-teal-light)",   border: "var(--mantine-color-teal-5)",   badge: "teal",   iconColor: "teal",   icon: <IconLock size={28} /> },
};

export interface DetectionStageMeta {
  title: string;
  color: string;
  icon: ReactNode;
}

export const DETECTION_STAGE_META: Record<DetectionStage, DetectionStageMeta> = {
  INCOMING:    { title: "Incoming",    color: "indigo", icon: <IconPackageImport size={16} /> },
  IN_PROGRESS: { title: "In progress", color: "grape",  icon: <IconProgress size={16} /> },
  FINAL:       { title: "Final",       color: "cyan",   icon: <IconCircleCheck size={16} /> },
};

export const DETECTION_STAGES: DetectionStage[] = ["INCOMING", "IN_PROGRESS", "FINAL"];

export const DISPOSITION_LABELS: Record<DispositionType, string> = {
  USE_AS_IS: "Use as-is (concession)",
  REWORK: "Rework",
  SCRAP: "Scrap",
  RETURN_TO_SUPPLIER: "Return to supplier",
  REGRADE: "Regrade",
};

export const DISPOSITION_OPTIONS: { value: DispositionType; label: string }[] = (
  Object.keys(DISPOSITION_LABELS) as DispositionType[]
).map((value) => ({ value, label: DISPOSITION_LABELS[value] }));
