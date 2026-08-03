import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { qk } from "@core/queryKeys";
import type { OilMartInvoice } from "@core/types";
import { listOilMartClients } from "../../../../../master-data/api";
import { listOilMartInvoices } from "../../../../api";
import { withinPeriod, type DocumentPeriod } from "../../../../components";

/** Active work, and what the approver bounced back. An invoice cannot be cancelled. */
const ACTIVE_STATUSES = ["PENDING_APPROVAL", "APPROVED"];
const REJECTED_STATUSES = ["REJECTED"];

export function useOilMartInvoices() {
  const navigate = useNavigate();

  const [period, setPeriod] = useState<DocumentPeriod>("THIS_MONTH");
  const [clientId, setClientId] = useState("ALL");
  const [search, setSearch] = useState("");

  const query = useQuery({ queryKey: qk.oilMartInvoices(), queryFn: () => listOilMartInvoices() });
  const clientsQuery = useQuery({
    queryKey: qk.oilMartClients(),
    queryFn: () => listOilMartClients(),
  });

  const visible = useMemo(() => {
    const needle = search.trim().toLowerCase();
    return (query.data ?? []).filter((invoice) => {
      if (!withinPeriod(invoice.invoiceDate, period)) return false;
      if (clientId !== "ALL" && invoice.clientId !== clientId) return false;
      if (
        needle &&
        !invoice.invoiceNo.toLowerCase().includes(needle) &&
        !invoice.quotationNo.toLowerCase().includes(needle) &&
        !invoice.clientName.toLowerCase().includes(needle)
      ) {
        return false;
      }
      return true;
    });
  }, [query.data, period, clientId, search]);

  const active = useMemo(
    () => visible.filter((invoice) => ACTIVE_STATUSES.includes(invoice.status)),
    [visible],
  );
  const rejected = useMemo(
    () => visible.filter((invoice) => REJECTED_STATUSES.includes(invoice.status)),
    [visible],
  );
  const awaitingApproval = useMemo(
    () => visible.filter((invoice) => invoice.status === "PENDING_APPROVAL").length,
    [visible],
  );

  return {
    query,
    clientsQuery,
    active,
    rejected,
    period,
    setPeriod,
    clientId,
    setClientId,
    search,
    setSearch,
    awaitingApproval,
    openNew: () => navigate("/oil-mart/invoices/new"),
    openDetail: (invoice: OilMartInvoice) => navigate(`/oil-mart/invoices/${invoice.id}`),
  };
}
