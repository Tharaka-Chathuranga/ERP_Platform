import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { qk } from "@core/queryKeys";
import { notifyError, notifySuccess } from "@core/notify";
import type { OilMartPaymentMethod, OilMartSale } from "@core/types";
import { listOilMartClients } from "../../../../../master-data/api";
import { listOilMartStock } from "../../../../../stock/api";
import {
  approveOilMartSale,
  approveOilMartQuotation,
  dispatchOilMartSale,
  invoiceOilMartSale,
  listOilMartSales,
  rejectOilMartQuotation,
  rejectOilMartSale,
  submitOilMartSaleForApproval,
  type DispatchOilMartSaleInput,
} from "../../../../api";
import { applySaleFilters, type SaleFilters } from "../../oil-mart-sales-board";

export type BoardAction =
  | "approveQuotation"
  | "rejectQuotation"
  | "approve"
  | "reject"
  | "dispatch"
  | "invoice";

export function useOilMartSales() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [clientId, setClientId] = useState("ALL");
  const [dateRange, setDateRange] = useState<[Date | null, Date | null]>([null, null]);
  const [showTerminal, setShowTerminal] = useState(false);
  const [pending, setPending] = useState<{ sale: OilMartSale; action: BoardAction } | null>(null);

  const query = useQuery({ queryKey: qk.oilMartSales(), queryFn: () => listOilMartSales() });
  const clientsQuery = useQuery({
    queryKey: qk.oilMartClients(),
    queryFn: () => listOilMartClients(),
  });
  const stockQuery = useQuery({ queryKey: qk.oilMartStock(), queryFn: listOilMartStock });

  const filters: SaleFilters = { clientId, dateRange, showTerminal };

  const sales = useMemo(
    () => applySaleFilters(query.data ?? [], filters),
    [query.data, clientId, dateRange, showTerminal],
  );

  const awaitingApproval = useMemo(
    () =>
      (query.data ?? []).filter(
        (sale) => sale.status === "QUOTATION_APPROVAL" || sale.status === "ORDERED",
      ).length,
    [query.data],
  );

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
    setPending(null);
  }

  const submitForApproval = useMutation({
    mutationFn: (sale: OilMartSale) => submitOilMartSaleForApproval(sale.id),
    onSuccess: (sale) => afterTransition(sale, `${sale.saleNo} sent for quotation approval`),
    onError: notifyError,
  });

  const approveQuotation = useMutation({
    mutationFn: () => approveOilMartQuotation(pending!.sale.id),
    onSuccess: (sale) => afterTransition(sale, `Quotation approved — order ${sale.saleNo} raised`),
    onError: notifyError,
  });

  const rejectQuotation = useMutation({
    mutationFn: (reason: string) => rejectOilMartQuotation(pending!.sale.id, reason),
    onSuccess: (sale) => afterTransition(sale, `${sale.saleNo} rejected at quotation approval`),
    onError: notifyError,
  });

  const approve = useMutation({
    mutationFn: () => approveOilMartSale(pending!.sale.id),
    onSuccess: (sale) => afterTransition(sale, `${sale.saleNo} approved`),
    onError: notifyError,
  });

  const reject = useMutation({
    mutationFn: (reason: string) => rejectOilMartSale(pending!.sale.id, reason),
    onSuccess: (sale) => afterTransition(sale, `${sale.saleNo} rejected`),
    onError: notifyError,
  });

  const dispatch = useMutation({
    mutationFn: (input: DispatchOilMartSaleInput) => dispatchOilMartSale(pending!.sale.id, input),
    onSuccess: (sale) => afterTransition(sale, `${sale.saleNo} dispatched — stock deducted`),
    onError: notifyError,
  });

  const invoice = useMutation({
    mutationFn: (paymentMethod: OilMartPaymentMethod) =>
      invoiceOilMartSale(pending!.sale.id, paymentMethod),
    onSuccess: (sale) => afterTransition(sale, `Invoice ${sale.invoiceNo} raised and settled`),
    onError: notifyError,
  });

  const busy =
    submitForApproval.isPending ||
    approveQuotation.isPending ||
    rejectQuotation.isPending ||
    approve.isPending ||
    reject.isPending ||
    dispatch.isPending ||
    invoice.isPending;

  return {
    query,
    sales,
    clientsQuery,
    stockQuery,
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
    submitForApproval,
    approveQuotation,
    rejectQuotation,
    approve,
    reject,
    dispatch,
    invoice,
    openNew: () => navigate("/oil-mart/sales/new"),
    openDetail: (sale: OilMartSale) => navigate(`/oil-mart/sales/${sale.id}`),
  };
}
