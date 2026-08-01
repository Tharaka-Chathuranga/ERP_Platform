import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { useParams } from "react-router-dom";
import { qk } from "@core/queryKeys";
import { getOilMartClient, listOilMartClientSales } from "../../../../api";

export function useOilMartClientDetail() {
  const { clientId = "" } = useParams();

  const clientQuery = useQuery({
    queryKey: qk.oilMartClient(clientId),
    queryFn: () => getOilMartClient(clientId),
    enabled: Boolean(clientId),
  });

  const salesQuery = useQuery({
    queryKey: qk.oilMartClientSales(clientId),
    queryFn: () => listOilMartClientSales(clientId),
    enabled: Boolean(clientId),
  });

  const stats = useMemo(() => {
    const sales = salesQuery.data ?? [];
    const invoiced = sales.filter((sale) => sale.status === "INVOICED");
    return {
      saleCount: sales.length,
      invoicedCount: invoiced.length,
      lifetimeValue: invoiced.reduce((sum, sale) => sum + sale.total, 0),
      inFlight: sales.filter((sale) =>
        ["QUOTATION", "ORDERED", "APPROVED", "DISPATCHED"].includes(sale.status),
      ).length,
      lastPurchaseAt: invoiced
        .map((sale) => sale.invoicedAt)
        .filter((value): value is string => Boolean(value))
        .sort()
        .slice(-1)[0],
    };
  }, [salesQuery.data]);

  return { clientId, clientQuery, salesQuery, stats };
}
