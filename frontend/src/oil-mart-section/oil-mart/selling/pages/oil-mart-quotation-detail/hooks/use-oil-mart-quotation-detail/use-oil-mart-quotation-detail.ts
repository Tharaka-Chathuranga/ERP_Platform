import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate, useParams } from "react-router-dom";
import { qk } from "@core/queryKeys";
import { notifyError, notifySuccess } from "@core/notify";
import type { OilMartQuotation } from "@core/types";
import {
  approveOilMartQuotation,
  cancelOilMartQuotation,
  getOilMartQuotation,
  oilMartQuotationPdfUrl,
  rejectOilMartQuotation,
  submitOilMartQuotation,
} from "../../../../api";

export type DetailModal = "approve" | "reject" | "cancel" | "preview";

export function useOilMartQuotationDetail() {
  const { quotationId } = useParams<{ quotationId: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [modal, setModal] = useState<DetailModal | null>(null);

  const quotationQuery = useQuery({
    queryKey: qk.oilMartQuotation(quotationId ?? ""),
    queryFn: () => getOilMartQuotation(quotationId!),
    enabled: Boolean(quotationId),
  });

  const quotation = quotationQuery.data;
  const token = quotation?.updatedAt ?? "";

  function afterTransition(next: OilMartQuotation, message: string) {
    queryClient.setQueryData(qk.oilMartQuotation(next.id), next);
    queryClient.invalidateQueries({ queryKey: qk.oilMartQuotations() });
    queryClient.invalidateQueries({ queryKey: qk.oilMartOverview() });
    queryClient.invalidateQueries({ queryKey: qk.oilMartClientQuotations(next.clientId) });
    notifySuccess(message);
    setModal(null);
  }

  function onConflict(error: unknown) {
    quotationQuery.refetch();
    notifyError(error);
  }

  const submitForApproval = useMutation({
    mutationFn: () => submitOilMartQuotation(quotationId!, token),
    onSuccess: (next) => afterTransition(next, `${next.quotationNo} sent for approval`),
    onError: onConflict,
  });

  const approve = useMutation({
    mutationFn: () => approveOilMartQuotation(quotationId!, token),
    onSuccess: (next) => afterTransition(next, `${next.quotationNo} approved`),
    onError: onConflict,
  });

  const reject = useMutation({
    mutationFn: (reason: string) => rejectOilMartQuotation(quotationId!, reason, token),
    onSuccess: (next) =>
      afterTransition(next, `${next.quotationNo} rejected and sent back for editing`),
    onError: onConflict,
  });

  const cancel = useMutation({
    mutationFn: (reason: string) => cancelOilMartQuotation(quotationId!, reason, token),
    onSuccess: (next) => afterTransition(next, `${next.quotationNo} cancelled`),
    onError: onConflict,
  });

  const busy =
    submitForApproval.isPending || approve.isPending || reject.isPending || cancel.isPending;

  return {
    quotationQuery,
    quotation,
    pdfPath: quotationId ? oilMartQuotationPdfUrl(quotationId) : undefined,
    modal,
    setModal,
    busy,
    submitForApproval,
    approve,
    reject,
    cancel,
    openEdit: () => navigate(`/oil-mart/quotations/${quotationId}/edit`),
  };
}
