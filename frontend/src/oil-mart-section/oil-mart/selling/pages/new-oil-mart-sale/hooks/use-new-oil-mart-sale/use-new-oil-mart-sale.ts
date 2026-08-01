import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import dayjs from "dayjs";
import { qk } from "@core/queryKeys";
import { notifyError, notifySuccess } from "@core/notify";
import {
  getEffectiveOilMartPrice,
  listOilMartClients,
  listOilMartItems,
} from "../../../../../master-data/api";
import { listOilMartStock } from "../../../../../stock/api";
import { createOilMartSale } from "../../../../api";
import { type SaleLineDraft } from "../../../../components/sale-line-editor";

let lineCounter = 0;
const newLine = (): SaleLineDraft => {
  lineCounter += 1;
  return {
    key: `sale-line-${lineCounter}`,
    itemId: null,
    quantityLitres: undefined,
    listUnitPrice: undefined,
    unitPrice: undefined,
    isPriceOverride: false,
    discountPercent: 0,
  };
};

export function useNewOilMartSale() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [clientId, setClientId] = useState<string | null>(null);
  const [quotedAt, setQuotedAt] = useState<Date | null>(new Date());
  const [validUntil, setValidUntil] = useState<Date | null>(dayjs().add(14, "day").toDate());
  const [note, setNote] = useState("");
  const [discountAmount, setDiscountAmount] = useState(0);
  const [lines, setLines] = useState<SaleLineDraft[]>([newLine()]);
  const [showErrors, setShowErrors] = useState(false);

  const itemsQuery = useQuery({ queryKey: qk.oilMartItems(), queryFn: () => listOilMartItems() });
  const clientsQuery = useQuery({
    queryKey: qk.oilMartClients(),
    queryFn: () => listOilMartClients(),
  });
  const stockQuery = useQuery({ queryKey: qk.oilMartStock(), queryFn: listOilMartStock });

  const linesValid = lines.every(
    (line) => line.itemId && (line.quantityLitres ?? 0) > 0 && (line.unitPrice ?? 0) > 0,
  );
  const valid = Boolean(clientId) && Boolean(quotedAt) && lines.length > 0 && linesValid;

  async function updateLine(key: string, patch: Partial<SaleLineDraft>) {
    setLines((prev) => prev.map((line) => (line.key === key ? { ...line, ...patch } : line)));

    if (patch.itemId) {
      const on = dayjs(quotedAt ?? new Date()).format("YYYY-MM-DD");
      const price = await getEffectiveOilMartPrice(patch.itemId, on);
      setLines((prev) =>
        prev.map((line) =>
          line.key === key
            ? {
                ...line,
                listUnitPrice: price?.sellPrice,
                unitPrice: price?.sellPrice,
                isPriceOverride: false,
              }
            : line,
        ),
      );
    }
  }

  const create = useMutation({
    mutationFn: () =>
      createOilMartSale({
        clientId: clientId!,
        quotedAt: dayjs(quotedAt).toISOString(),
        validUntil: validUntil ? dayjs(validUntil).format("YYYY-MM-DD") : undefined,
        discountAmount,
        note: note.trim() || undefined,
        lines: lines.map((line) => ({
          itemId: line.itemId!,
          quantityLitres: line.quantityLitres!,
          listUnitPrice: line.listUnitPrice ?? line.unitPrice!,
          unitPrice: line.unitPrice!,
          isPriceOverride: line.isPriceOverride,
          discountPercent: line.discountPercent || 0,
        })),
      }),
    onSuccess: (sale) => {
      queryClient.invalidateQueries({ queryKey: qk.oilMartSales() });
      queryClient.invalidateQueries({ queryKey: qk.oilMartOverview() });
      queryClient.invalidateQueries({ queryKey: qk.oilMartClientSales(sale.clientId) });
      notifySuccess(`${sale.saleNo} raised as a quotation`);
      navigate(`/oil-mart/sales/${sale.id}`);
    },
    onError: notifyError,
  });

  function submit() {
    setShowErrors(true);
    if (!valid) return;
    create.mutate();
  }

  return {
    clientId,
    setClientId,
    quotedAt,
    setQuotedAt,
    validUntil,
    setValidUntil,
    note,
    setNote,
    discountAmount,
    setDiscountAmount,
    lines,
    valid,
    showErrors,
    itemsQuery,
    clientsQuery,
    stockQuery,
    create,
    submit,
    updateLine,
    addLine: () => setLines((prev) => [...prev, newLine()]),
    removeLine: (key: string) => setLines((prev) => prev.filter((line) => line.key !== key)),
    cancel: () => navigate("/oil-mart/sales"),
  };
}
