import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import dayjs from "dayjs";
import { qk } from "@core/queryKeys";
import { notifyError, notifySuccess } from "@core/notify";
import { createOilMartInvoice, listInvoiceableOilMartQuotations } from "../../../../api";

export function useNewOilMartInvoice() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [quotationId, setQuotationId] = useState<string | null>(null);
  const [invoiceDate, setInvoiceDate] = useState<Date | null>(new Date());
  const [note, setNote] = useState("");
  const [showErrors, setShowErrors] = useState(false);

  const quotationsQuery = useQuery({
    queryKey: qk.oilMartInvoiceableQuotations(),
    queryFn: listInvoiceableOilMartQuotations,
  });

  const selected = (quotationsQuery.data ?? []).find(
    (quotation) => quotation.id === quotationId,
  );
  const valid = Boolean(quotationId) && Boolean(invoiceDate) && !selected?.expired;

  const create = useMutation({
    mutationFn: () =>
      createOilMartInvoice({
        quotationId: quotationId!,
        invoiceDate: dayjs(invoiceDate).format("YYYY-MM-DD"),
        note: note.trim() || undefined,
      }),
    onSuccess: (invoice) => {
      queryClient.setQueryData(qk.oilMartInvoice(invoice.id), invoice);
      queryClient.invalidateQueries({ queryKey: qk.oilMartInvoices() });
      queryClient.invalidateQueries({ queryKey: qk.oilMartInvoiceableQuotations() });
      queryClient.invalidateQueries({ queryKey: qk.oilMartOverview() });
      notifySuccess(`${invoice.invoiceNo} raised from ${invoice.quotationNo}`);
      navigate(`/oil-mart/invoices/${invoice.id}`);
    },
    onError: notifyError,
  });

  function submit() {
    setShowErrors(true);
    if (!valid) return;
    create.mutate();
  }

  return {
    quotationsQuery,
    quotationId,
    setQuotationId,
    selected,
    invoiceDate,
    setInvoiceDate,
    note,
    setNote,
    valid,
    showErrors,
    create,
    submit,
    cancel: () => navigate("/oil-mart/invoices"),
  };
}
