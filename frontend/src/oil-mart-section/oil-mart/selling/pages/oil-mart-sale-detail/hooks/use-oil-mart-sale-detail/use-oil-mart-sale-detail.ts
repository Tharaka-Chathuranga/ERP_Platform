import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useParams } from "react-router-dom";
import { qk } from "@core/queryKeys";
import { notifyError, notifySuccess } from "@core/notify";
import type { OilMartPaymentMethod, OilMartSale } from "@core/types";
import { listOilMartStock } from "../../../../../stock/api";
import {
  approveOilMartSale,
  cancelOilMartSale,
  approveOilMartQuotation,
  dispatchOilMartSale,
  getOilMartSale,
  invoiceOilMartSale,
  rejectOilMartQuotation,
  rejectOilMartSale,
  submitOilMartSaleForApproval,
  type DispatchOilMartSaleInput,
} from "../../../../api";

type ModalKind =
  | "approveQuotation"
  | "rejectQuotation"
  | "approve"
  | "reject"
  | "dispatch"
  | "invoice"
  | "cancel"
  | null;

export function useOilMartSaleDetail() {
  const { saleId = "" } = useParams();
  const queryClient = useQueryClient();
  const [modal, setModal] = useState<ModalKind>(null);

  const saleQuery = useQuery({
    queryKey: qk.oilMartSale(saleId),
    queryFn: () => getOilMartSale(saleId),
    enabled: Boolean(saleId),
  });

  const stockQuery = useQuery({ queryKey: qk.oilMartStock(), queryFn: listOilMartStock });

  function afterTransition(sale: OilMartSale, message: string) {
    queryClient.setQueryData(qk.oilMartSale(sale.id), sale);
    queryClient.invalidateQueries({ queryKey: qk.oilMartSales() });
    queryClient.invalidateQueries({ queryKey: qk.oilMartStock() });
    queryClient.invalidateQueries({ queryKey: qk.oilMartOverview() });
    queryClient.invalidateQueries({ queryKey: qk.oilMartClientSales(sale.clientId) });
    sale.lines.forEach((line) =>
      queryClient.invalidateQueries({ queryKey: qk.oilMartMovements(line.itemId) }),
    );
    notifySuccess(message);
    setModal(null);
  }

  const submitForApproval = useMutation({
    mutationFn: () => submitOilMartSaleForApproval(saleId),
    onSuccess: (sale) => afterTransition(sale, `${sale.saleNo} sent for quotation approval`),
    onError: notifyError,
  });

  const approveQuotation = useMutation({
    mutationFn: () => approveOilMartQuotation(saleId),
    onSuccess: (sale) => afterTransition(sale, `Quotation approved — order ${sale.saleNo} raised`),
    onError: notifyError,
  });

  const rejectQuotation = useMutation({
    mutationFn: (reason: string) => rejectOilMartQuotation(saleId, reason),
    onSuccess: (sale) => afterTransition(sale, `${sale.saleNo} rejected at quotation approval`),
    onError: notifyError,
  });

  const approve = useMutation({
    mutationFn: () => approveOilMartSale(saleId),
    onSuccess: (sale) => afterTransition(sale, `${sale.saleNo} approved`),
    onError: notifyError,
  });

  const reject = useMutation({
    mutationFn: (reason: string) => rejectOilMartSale(saleId, reason),
    onSuccess: (sale) => afterTransition(sale, `${sale.saleNo} rejected`),
    onError: notifyError,
  });

  const dispatch = useMutation({
    mutationFn: (input: DispatchOilMartSaleInput) => dispatchOilMartSale(saleId, input),
    onSuccess: (sale) => afterTransition(sale, `${sale.saleNo} dispatched — stock deducted`),
    onError: notifyError,
  });

  const invoice = useMutation({
    mutationFn: (paymentMethod: OilMartPaymentMethod) =>
      invoiceOilMartSale(saleId, paymentMethod),
    onSuccess: (sale) => afterTransition(sale, `Invoice ${sale.invoiceNo} raised and settled`),
    onError: notifyError,
  });

  const cancel = useMutation({
    mutationFn: (reason: string) => cancelOilMartSale(saleId, reason),
    onSuccess: (sale) => afterTransition(sale, `${sale.saleNo} cancelled`),
    onError: notifyError,
  });

  const busy =
    submitForApproval.isPending ||
    approveQuotation.isPending ||
    rejectQuotation.isPending ||
    approve.isPending ||
    reject.isPending ||
    dispatch.isPending ||
    invoice.isPending ||
    cancel.isPending;

  return {
    saleId,
    saleQuery,
    stockQuery,
    modal,
    setModal,
    busy,
    submitForApproval,
    approveQuotation,
    rejectQuotation,
    approve,
    reject,
    dispatch,
    invoice,
    cancel,
  };
}
