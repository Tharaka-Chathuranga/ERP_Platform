import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { qk } from "@core/queryKeys";
import type { OilMartQuotation, OilMartStockBalance } from "@core/types";
import { getOilMartOverview } from "../../../../api";

export function useOilMartOverview() {
  const navigate = useNavigate();

  const query = useQuery({ queryKey: qk.oilMartOverview(), queryFn: getOilMartOverview });

  return {
    query,
    overview: query.data,
    openStockItem: (balance: OilMartStockBalance) =>
      navigate(`/oil-mart/items/${balance.itemId}`),
    openQuotation: (quotation: OilMartQuotation) =>
      navigate(`/oil-mart/quotations/${quotation.id}`),
  };
}
