import type { OilMartOverviewPeriod } from "@core/types";

export const OIL_MART_PERIOD_OPTIONS: { value: OilMartOverviewPeriod; label: string }[] = [
  { value: "TODAY", label: "Today" },
  { value: "THIS_WEEK", label: "This week" },
  { value: "THIS_MONTH", label: "This month" },
];

/** The trend needs at least a few buckets to have shape, so a single day is not offered. */
export const OIL_MART_CHART_PERIOD_OPTIONS = OIL_MART_PERIOD_OPTIONS.filter(
  (option) => option.value !== "TODAY",
);

export function oilMartPeriodLabel(period: OilMartOverviewPeriod): string {
  return OIL_MART_PERIOD_OPTIONS.find((option) => option.value === period)?.label ?? "This month";
}
