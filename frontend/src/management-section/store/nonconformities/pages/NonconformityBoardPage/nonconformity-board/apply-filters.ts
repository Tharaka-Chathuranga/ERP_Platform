import dayjs from "dayjs";
import type { NonconformityReport, NonconformityStatus } from "@core/types";
import type { BoardFilters } from "../hooks/use-nonconformity-board";

export function applyFilters(items: NonconformityReport[], filters: BoardFilters): NonconformityReport[] {
  const [from, to] = filters.dateRange;

  return items.filter((d) => {
    if (filters.status && d.status !== (filters.status as NonconformityStatus)) return false;
    if (from && dayjs(d.reportedAt).isBefore(dayjs(from), "day")) return false;
    if (to && dayjs(d.reportedAt).isAfter(dayjs(to), "day")) return false;
    return true;
  });
}
