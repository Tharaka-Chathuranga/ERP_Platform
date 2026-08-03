import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { qk } from "@core/queryKeys";
import type { OilMartQuotation } from "@core/types";
import { listOilMartClients } from "../../../../../master-data/api";
import { listOilMartQuotations } from "../../../../api";
import { withinPeriod, type DocumentPeriod } from "../../../../components";

/** Active work, what the approver bounced back, and what is closed for good. */
const ACTIVE_STATUSES = ["DRAFT", "PENDING_APPROVAL", "APPROVED"];
const REJECTED_STATUSES = ["REJECTED"];
const CLOSED_STATUSES = ["CANCELLED"];

export function useOilMartQuotations() {
  const navigate = useNavigate();

  const [period, setPeriod] = useState<DocumentPeriod>("THIS_MONTH");
  const [clientId, setClientId] = useState("ALL");
  const [search, setSearch] = useState("");

  const query = useQuery({
    queryKey: qk.oilMartQuotations(),
    queryFn: () => listOilMartQuotations(),
  });
  const clientsQuery = useQuery({
    queryKey: qk.oilMartClients(),
    queryFn: () => listOilMartClients(),
  });

  const visible = useMemo(() => {
    const needle = search.trim().toLowerCase();
    return (query.data ?? []).filter((quotation) => {
      if (!withinPeriod(quotation.issuedDate, period)) return false;
      if (clientId !== "ALL" && quotation.clientId !== clientId) return false;
      if (
        needle &&
        !quotation.quotationNo.toLowerCase().includes(needle) &&
        !quotation.clientName.toLowerCase().includes(needle)
      ) {
        return false;
      }
      return true;
    });
  }, [query.data, period, clientId, search]);

  const active = useMemo(
    () => visible.filter((quotation) => ACTIVE_STATUSES.includes(quotation.status)),
    [visible],
  );
  const rejected = useMemo(
    () => visible.filter((quotation) => REJECTED_STATUSES.includes(quotation.status)),
    [visible],
  );
  const closed = useMemo(
    () => visible.filter((quotation) => CLOSED_STATUSES.includes(quotation.status)),
    [visible],
  );

  const awaitingApproval = useMemo(
    () => visible.filter((quotation) => quotation.status === "PENDING_APPROVAL").length,
    [visible],
  );

  return {
    query,
    clientsQuery,
    active,
    rejected,
    closed,
    period,
    setPeriod,
    clientId,
    setClientId,
    search,
    setSearch,
    awaitingApproval,
    openNew: () => navigate("/oil-mart/quotations/new"),
    openDetail: (quotation: OilMartQuotation) => navigate(`/oil-mart/quotations/${quotation.id}`),
  };
}
