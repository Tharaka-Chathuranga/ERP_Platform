import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import dayjs from "dayjs";
import { qk } from "@core/queryKeys";
import type { OilMartInvoice, OilMartInvoiceStatus } from "@core/types";
import { listOilMartClients } from "../../../../../master-data/api";
import { listOilMartInvoices } from "../../../../api";

export function useOilMartInvoices() {
  const navigate = useNavigate();

  const [status, setStatus] = useState<OilMartInvoiceStatus | "ALL">("ALL");
  const [clientId, setClientId] = useState("ALL");
  const [dateRange, setDateRange] = useState<[Date | null, Date | null]>([null, null]);

  const query = useQuery({ queryKey: qk.oilMartInvoices(), queryFn: () => listOilMartInvoices() });
  const clientsQuery = useQuery({
    queryKey: qk.oilMartClients(),
    queryFn: () => listOilMartClients(),
  });

  const invoices = useMemo(() => {
    const [from, to] = dateRange;
    return (query.data ?? []).filter((invoice) => {
      if (status !== "ALL" && invoice.status !== status) return false;
      if (clientId !== "ALL" && invoice.clientId !== clientId) return false;
      const invoiceDate = dayjs(invoice.invoiceDate);
      if (from && invoiceDate.isBefore(dayjs(from).startOf("day"))) return false;
      if (to && invoiceDate.isAfter(dayjs(to).endOf("day"))) return false;
      return true;
    });
  }, [query.data, status, clientId, dateRange]);

  const awaitingApproval = useMemo(
    () => (query.data ?? []).filter((invoice) => invoice.status === "PENDING_APPROVAL").length,
    [query.data],
  );

  return {
    query,
    invoices,
    clientsQuery,
    status,
    setStatus,
    clientId,
    setClientId,
    dateRange,
    setDateRange,
    awaitingApproval,
    openNew: () => navigate("/oil-mart/invoices/new"),
    openDetail: (invoice: OilMartInvoice) => navigate(`/oil-mart/invoices/${invoice.id}`),
  };
}
