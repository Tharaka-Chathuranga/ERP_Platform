import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { qk } from "@core/queryKeys";
import { notifyError, notifySuccess } from "@core/notify";
import type { OilMartQuotation } from "@core/types";
import { listOilMartClients } from "../../../../../master-data/api";
import {
  approveOilMartQuotation,
  cancelOilMartQuotation,
  listOilMartQuotations,
  rejectOilMartQuotation,
  submitOilMartQuotation,
} from "../../../../api";
import { applyQuotationFilters, type QuotationFilters } from "../../oil-mart-quotations-board";

export type BoardAction = "approve" | "reject" | "cancel" | "preview";

export function useOilMartQuotations() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [clientId, setClientId] = useState("ALL");
  const [dateRange, setDateRange] = useState<[Date | null, Date | null]>([null, null]);
  const [showTerminal, setShowTerminal] = useState(false);
  const [pending, setPending] = useState<{
    quotation: OilMartQuotation;
    action: BoardAction;
  } | null>(null);

  const query = useQuery({
    queryKey: qk.oilMartQuotations(),
    queryFn: () => listOilMartQuotations(),
  });
  const clientsQuery = useQuery({
    queryKey: qk.oilMartClients(),
    queryFn: () => listOilMartClients(),
  });

  const filters: QuotationFilters = { clientId, dateRange, showTerminal };

  const quotations = useMemo(
    () => applyQuotationFilters(query.data ?? [], filters),
    [query.data, clientId, dateRange, showTerminal],
  );

  const awaitingApproval = useMemo(
    () => (query.data ?? []).filter((quotation) => quotation.status === "PENDING_APPROVAL").length,
    [query.data],
  );

  function afterTransition(quotation: OilMartQuotation, message: string) {
    queryClient.setQueryData(qk.oilMartQuotation(quotation.id), quotation);
    queryClient.invalidateQueries({ queryKey: qk.oilMartQuotations() });
    queryClient.invalidateQueries({ queryKey: qk.oilMartOverview() });
    queryClient.invalidateQueries({ queryKey: qk.oilMartClientQuotations(quotation.clientId) });
    notifySuccess(message);
    setPending(null);
  }

  const submit = useMutation({
    mutationFn: (quotation: OilMartQuotation) =>
      submitOilMartQuotation(quotation.id, quotation.updatedAt),
    onSuccess: (quotation) =>
      afterTransition(quotation, `${quotation.quotationNo} sent for approval`),
    onError: notifyError,
  });

  const approve = useMutation({
    mutationFn: () => approveOilMartQuotation(pending!.quotation.id, pending!.quotation.updatedAt),
    onSuccess: (quotation) => afterTransition(quotation, `${quotation.quotationNo} approved`),
    onError: notifyError,
  });

  const reject = useMutation({
    mutationFn: (reason: string) =>
      rejectOilMartQuotation(pending!.quotation.id, reason, pending!.quotation.updatedAt),
    onSuccess: (quotation) =>
      afterTransition(quotation, `${quotation.quotationNo} rejected and sent back for editing`),
    onError: notifyError,
  });

  const cancel = useMutation({
    mutationFn: (reason: string) =>
      cancelOilMartQuotation(pending!.quotation.id, reason, pending!.quotation.updatedAt),
    onSuccess: (quotation) => afterTransition(quotation, `${quotation.quotationNo} cancelled`),
    onError: notifyError,
  });

  const busy = submit.isPending || approve.isPending || reject.isPending || cancel.isPending;

  return {
    query,
    quotations,
    clientsQuery,
    clientId,
    setClientId,
    dateRange,
    setDateRange,
    showTerminal,
    setShowTerminal,
    awaitingApproval,
    pending,
    setPending,
    closePending: () => setPending(null),
    busy,
    submit,
    approve,
    reject,
    cancel,
    openNew: () => navigate("/oil-mart/quotations/new"),
    openDetail: (quotation: OilMartQuotation) => navigate(`/oil-mart/quotations/${quotation.id}`),
  };
}
