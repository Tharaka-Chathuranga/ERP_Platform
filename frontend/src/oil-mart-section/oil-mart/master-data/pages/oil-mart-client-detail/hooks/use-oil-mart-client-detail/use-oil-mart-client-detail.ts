import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { useParams } from "react-router-dom";
import { qk } from "@core/queryKeys";
import { getOilMartClient, listOilMartClientQuotations } from "../../../../api";

export function useOilMartClientDetail() {
  const { clientId = "" } = useParams();

  const clientQuery = useQuery({
    queryKey: qk.oilMartClient(clientId),
    queryFn: () => getOilMartClient(clientId),
    enabled: Boolean(clientId),
  });

  const quotationsQuery = useQuery({
    queryKey: qk.oilMartClientQuotations(clientId),
    queryFn: () => listOilMartClientQuotations(clientId),
    enabled: Boolean(clientId),
  });

  const stats = useMemo(() => {
    const quotations = quotationsQuery.data ?? [];
    const approved = quotations.filter((quotation) => quotation.status === "APPROVED");
    return {
      quotationCount: quotations.length,
      approvedCount: approved.length,
      approvedValue: approved.reduce((sum, quotation) => sum + quotation.grandTotal, 0),
      inFlight: quotations.filter((quotation) =>
        ["DRAFT", "PENDING_APPROVAL"].includes(quotation.status),
      ).length,
      lastApprovedAt: approved
        .map((quotation) => quotation.approvedAt)
        .filter((value): value is string => Boolean(value))
        .sort()
        .slice(-1)[0],
    };
  }, [quotationsQuery.data]);

  return { clientId, clientQuery, quotationsQuery, stats };
}
