import dayjs from "dayjs";
import type { OilMartQuotation } from "@core/types";
import { OIL_MART_QUOTATION_TERMINAL_STATUSES } from "../../../components";

export interface QuotationFilters {
  clientId: string;
  dateRange: [Date | null, Date | null];
  showTerminal: boolean;
}

export function applyQuotationFilters(
  quotations: OilMartQuotation[],
  filters: QuotationFilters,
): OilMartQuotation[] {
  const [from, to] = filters.dateRange;

  return quotations.filter((quotation) => {
    if (
      !filters.showTerminal &&
      OIL_MART_QUOTATION_TERMINAL_STATUSES.includes(quotation.status)
    ) {
      return false;
    }
    if (filters.clientId !== "ALL" && quotation.clientId !== filters.clientId) return false;

    const issuedDate = dayjs(quotation.issuedDate);
    if (from && issuedDate.isBefore(dayjs(from).startOf("day"))) return false;
    if (to && issuedDate.isAfter(dayjs(to).endOf("day"))) return false;

    return true;
  });
}
