import dayjs from "dayjs";
import type { OilMartSale } from "@core/types";
import { OIL_MART_TERMINAL_STATUSES } from "../../../components/oil-mart-sale-meta";

export interface SaleFilters {
  clientId: string;
  dateRange: [Date | null, Date | null];
  showTerminal: boolean;
}

export function applySaleFilters(sales: OilMartSale[], filters: SaleFilters): OilMartSale[] {
  const [from, to] = filters.dateRange;

  return sales.filter((sale) => {
    if (!filters.showTerminal && OIL_MART_TERMINAL_STATUSES.includes(sale.status)) return false;
    if (filters.clientId !== "ALL" && sale.clientId !== filters.clientId) return false;

    const quotedAt = dayjs(sale.quotedAt);
    if (from && quotedAt.isBefore(dayjs(from).startOf("day"))) return false;
    if (to && quotedAt.isAfter(dayjs(to).endOf("day"))) return false;

    return true;
  });
}
