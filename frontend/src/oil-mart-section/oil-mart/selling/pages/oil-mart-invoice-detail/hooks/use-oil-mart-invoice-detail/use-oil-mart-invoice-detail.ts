import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useParams } from "react-router-dom";
import { qk } from "@core/queryKeys";
import { notifyError, notifySuccess } from "@core/notify";
import type { OilMartInvoice } from "@core/types";
import {
  approveOilMartInvoice,
  getOilMartInvoice,
  listInvoiceableOilMartQuotations,
  oilMartInvoicePdfUrl,
  rejectOilMartInvoice,
  reselectOilMartInvoiceQuotation,
} from "../../../../api";

export type InvoiceDetailModal = "reject" | "preview" | "reselect";

export function useOilMartInvoiceDetail() {
  const { invoiceId } = useParams<{ invoiceId: string }>();
  const queryClient = useQueryClient();
  const [modal, setModal] = useState<InvoiceDetailModal | null>(null);

  const invoiceQuery = useQuery({
    queryKey: qk.oilMartInvoice(invoiceId ?? ""),
    queryFn: () => getOilMartInvoice(invoiceId!),
    enabled: Boolean(invoiceId),
  });

  const invoice = invoiceQuery.data;
  const token = invoice?.updatedAt ?? "";

  const invoiceableQuery = useQuery({
    queryKey: qk.oilMartInvoiceableQuotations(),
    queryFn: listInvoiceableOilMartQuotations,
    enabled: modal === "reselect",
  });

  function afterTransition(next: OilMartInvoice, message: string) {
    queryClient.setQueryData(qk.oilMartInvoice(next.id), next);
    queryClient.invalidateQueries({ queryKey: qk.oilMartInvoices() });
    queryClient.invalidateQueries({ queryKey: qk.oilMartInvoiceableQuotations() });
    queryClient.invalidateQueries({ queryKey: qk.oilMartOverview() });
    queryClient.invalidateQueries({ queryKey: qk.oilMartStock() });
    next.lines.forEach((line) =>
      queryClient.invalidateQueries({ queryKey: qk.oilMartMovements(line.itemId) }),
    );
    notifySuccess(message);
    setModal(null);
  }

  function onConflict(error: unknown) {
    invoiceQuery.refetch();
    notifyError(error);
  }

  const approve = useMutation({
    mutationFn: () => approveOilMartInvoice(invoiceId!, token),
    onSuccess: (next) =>
      afterTransition(next, `${next.invoiceNo} approved — stock deducted`),
    onError: onConflict,
  });

  const reject = useMutation({
    mutationFn: (reason: string) => rejectOilMartInvoice(invoiceId!, reason, token),
    onSuccess: (next) =>
      afterTransition(next, `${next.invoiceNo} rejected — the author has been notified`),
    onError: onConflict,
  });

  const reselect = useMutation({
    mutationFn: (quotationId: string) =>
      reselectOilMartInvoiceQuotation(invoiceId!, quotationId, token),
    onSuccess: (next) =>
      afterTransition(next, `${next.invoiceNo} now quotes ${next.quotationNo}`),
    onError: onConflict,
  });

  const busy = approve.isPending || reject.isPending || reselect.isPending;

  return {
    invoiceQuery,
    invoice,
    invoiceableQuery,
    pdfPath: invoiceId ? oilMartInvoicePdfUrl(invoiceId) : undefined,
    modal,
    setModal,
    busy,
    approve,
    reject,
    reselect,
  };
}
