import { useState } from "react";

export type DateRange = [Date | null, Date | null];

export interface BoardFilters {
  status: string;
  dateRange: DateRange;
}

const EMPTY_FILTERS: BoardFilters = { status: "", dateRange: [null, null] };

export function useNonconformityBoard() {
  const [filters, setFilters] = useState<BoardFilters>(EMPTY_FILTERS);

  const setStatus = (value: string) => setFilters((f) => ({ ...f, status: value }));
  const setDateRange = (value: DateRange) => setFilters((f) => ({ ...f, dateRange: value }));

  return { filters, setStatus, setDateRange };
}
