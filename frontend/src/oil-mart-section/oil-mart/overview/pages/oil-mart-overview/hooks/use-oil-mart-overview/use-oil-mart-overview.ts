import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { qk } from "@core/queryKeys";
import type { OilMartOverviewPeriod, OilMartQuotation, OilMartStockBalance } from "@core/types";
import { getOilMartOverview } from "../../../../api";

/** The summary cards are always today; only the trend below is selectable. */
const CARD_PERIOD: OilMartOverviewPeriod = "TODAY";

export function useOilMartOverview() {
  const navigate = useNavigate();
  const [chartPeriod, setChartPeriod] = useState<OilMartOverviewPeriod>("THIS_WEEK");

  const cardQuery = useQuery({
    queryKey: qk.oilMartOverview(CARD_PERIOD),
    queryFn: () => getOilMartOverview(CARD_PERIOD),
  });

  const chartQuery = useQuery({
    queryKey: qk.oilMartOverview(chartPeriod),
    queryFn: () => getOilMartOverview(chartPeriod),
    placeholderData: (previous) => previous,
  });

  return {
    query: cardQuery,
    overview: cardQuery.data,
    chartQuery,
    chartOverview: chartQuery.data,
    chartPeriod,
    setChartPeriod,
    openStockItem: (balance: OilMartStockBalance) => navigate(`/oil-mart/items/${balance.itemId}`),
    openQuotation: (quotation: OilMartQuotation) =>
      navigate(`/oil-mart/quotations/${quotation.id}`),
  };
}
