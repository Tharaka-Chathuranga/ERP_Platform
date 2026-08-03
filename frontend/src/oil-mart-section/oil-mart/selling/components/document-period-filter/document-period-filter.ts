import dayjs from "dayjs";

export type DocumentPeriod = "THIS_MONTH" | "LAST_MONTH" | "ALL";

export const DOCUMENT_PERIOD_OPTIONS: { value: DocumentPeriod; label: string }[] = [
  { value: "THIS_MONTH", label: "This month" },
  { value: "LAST_MONTH", label: "Last month" },
  { value: "ALL", label: "All time" },
];

/** True when an ISO date (yyyy-MM-dd) falls inside the chosen period. */
export function withinPeriod(isoDate: string, period: DocumentPeriod): boolean {
  if (period === "ALL") return true;
  const anchor = period === "THIS_MONTH" ? dayjs() : dayjs().subtract(1, "month");
  return dayjs(isoDate).isSame(anchor, "month");
}

export function periodLabel(period: DocumentPeriod): string {
  return DOCUMENT_PERIOD_OPTIONS.find((option) => option.value === period)?.label ?? "All time";
}
