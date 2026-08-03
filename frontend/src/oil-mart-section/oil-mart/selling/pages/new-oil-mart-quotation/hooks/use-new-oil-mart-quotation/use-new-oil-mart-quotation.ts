import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate, useParams } from "react-router-dom";
import dayjs from "dayjs";
import { qk } from "@core/queryKeys";
import { notifyError, notifySuccess } from "@core/notify";
import { useCan } from "@auth/useCan";
import { OILMART_PROFIT_VIEW } from "@auth/permissions";
import type { OilMartQuotation } from "@core/types";
import {
  getEffectiveOilMartPrice,
  listOilMartClients,
  listOilMartItems,
  quickAddOilMartClient,
} from "../../../../../master-data/api";
import { listOilMartStock } from "../../../../../stock/api";
import {
  createOilMartQuotation,
  getOilMartQuotation,
  reviseOilMartQuotation,
  type SaveOilMartQuotationInput,
} from "../../../../api";
import { type QuotationLineDraft } from "../../../../components";

const DEFAULT_GST_RATE_PERCENT = 10;

let lineCounter = 0;
const newLine = (): QuotationLineDraft => {
  lineCounter += 1;
  return {
    key: `quotation-line-${lineCounter}`,
    itemId: null,
    quantityLitres: undefined,
    listUnitPrice: undefined,
    unitPrice: undefined,
    unitCost: undefined,
    isPriceOverride: false,
    discountPercent: 0,
  };
};

const draftFrom = (quotation: OilMartQuotation): QuotationLineDraft[] =>
  quotation.lines.map((line) => {
    lineCounter += 1;
    return {
      key: `quotation-line-${lineCounter}`,
      itemId: line.itemId,
      quantityLitres: line.quantityLitres,
      listUnitPrice: line.listUnitPrice,
      unitPrice: line.unitPrice,
      unitCost: line.unitCost,
      isPriceOverride: line.isPriceOverride,
      discountPercent: line.discountPercent,
    };
  });

export function useNewOilMartQuotation() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const can = useCan();
  const showProfit = can(OILMART_PROFIT_VIEW);

  const { quotationId } = useParams<{ quotationId: string }>();
  const editing = Boolean(quotationId);

  const [clientId, setClientId] = useState<string | null>(null);
  const [issuedDate, setIssuedDate] = useState<Date | null>(new Date());
  const [validUntil, setValidUntil] = useState<Date | null>(dayjs().add(1, "month").toDate());
  const [note, setNote] = useState("");
  const [lines, setLines] = useState<QuotationLineDraft[]>([newLine()]);
  const [showErrors, setShowErrors] = useState(false);

  const existingQuery = useQuery({
    queryKey: qk.oilMartQuotation(quotationId ?? ""),
    queryFn: () => getOilMartQuotation(quotationId!),
    enabled: editing,
  });
  const existing = existingQuery.data;

  useEffect(() => {
    if (!existing) return;
    setClientId(existing.clientId);
    setIssuedDate(dayjs(existing.issuedDate).toDate());
    setValidUntil(dayjs(existing.validUntil).toDate());
    setNote(existing.note ?? "");
    setLines(draftFrom(existing));
  }, [existing]);

  const itemsQuery = useQuery({ queryKey: qk.oilMartItems(), queryFn: () => listOilMartItems() });
  const clientsQuery = useQuery({
    queryKey: qk.oilMartClients(),
    queryFn: () => listOilMartClients(),
  });
  const stockQuery = useQuery({ queryKey: qk.oilMartStock(), queryFn: listOilMartStock });

  const minValidUntil = dayjs(issuedDate ?? new Date()).add(1, "month").toDate();
  const validityTooShort = Boolean(
    validUntil && dayjs(validUntil).isBefore(dayjs(minValidUntil), "day"),
  );

  const linesValid = lines.every(
    (line) => line.itemId && (line.quantityLitres ?? 0) > 0 && (line.unitPrice ?? 0) > 0,
  );
  const valid =
    Boolean(clientId) && Boolean(issuedDate) && Boolean(validUntil) && lines.length > 0 && linesValid;

  const quickAdd = useMutation({
    mutationFn: (name: string) => quickAddOilMartClient(name),
    onSuccess: (client) => {
      queryClient.invalidateQueries({ queryKey: qk.oilMartClients() });
      setClientId(client.id);
      notifySuccess(`${client.name} added as ${client.code}`);
    },
    onError: notifyError,
  });

  async function updateLine(key: string, patch: Partial<QuotationLineDraft>) {
    setLines((prev) => prev.map((line) => (line.key === key ? { ...line, ...patch } : line)));

    if (patch.itemId) {
      const on = dayjs(issuedDate ?? new Date()).format("YYYY-MM-DD");
      const price = await getEffectiveOilMartPrice(patch.itemId, on);
      setLines((prev) =>
        prev.map((line) =>
          line.key === key
            ? {
                ...line,
                listUnitPrice: price?.sellPrice,
                unitPrice: price?.sellPrice,
                unitCost: showProfit ? price?.buyPrice : undefined,
                isPriceOverride: false,
              }
            : line,
        ),
      );
    }
  }

  function payload(): SaveOilMartQuotationInput {
    return {
      clientId: clientId!,
      issuedDate: dayjs(issuedDate).format("YYYY-MM-DD"),
      validUntil: dayjs(validUntil).format("YYYY-MM-DD"),
      note: note.trim() || undefined,
      lines: lines.map((line) => ({
        itemId: line.itemId!,
        quantityLitres: line.quantityLitres!,
        listUnitPrice: line.listUnitPrice,
        unitPrice: line.unitPrice,
        discountPercent: line.discountPercent || 0,
      })),
    };
  }

  function afterSave(quotation: OilMartQuotation, message: string) {
    queryClient.setQueryData(qk.oilMartQuotation(quotation.id), quotation);
    queryClient.invalidateQueries({ queryKey: qk.oilMartQuotations() });
    queryClient.invalidateQueries({ queryKey: qk.oilMartOverview() });
    queryClient.invalidateQueries({ queryKey: qk.oilMartClientQuotations(quotation.clientId) });
    notifySuccess(message);
    navigate(`/oil-mart/quotations/${quotation.id}`);
  }

  const create = useMutation({
    mutationFn: () => createOilMartQuotation(payload()),
    onSuccess: (quotation) => afterSave(quotation, `${quotation.quotationNo} raised as a draft`),
    onError: notifyError,
  });

  const revise = useMutation({
    mutationFn: () => reviseOilMartQuotation(quotationId!, payload(), existing!.updatedAt),
    onSuccess: (quotation) =>
      afterSave(
        quotation,
        quotation.status === "PENDING_APPROVAL"
          ? `${quotation.quotationNo} updated and resubmitted for approval`
          : `${quotation.quotationNo} updated`,
      ),
    onError: notifyError,
  });

  const save = editing ? revise : create;

  function submit() {
    setShowErrors(true);
    if (!valid) return;
    save.mutate();
  }

  return {
    editing,
    existing,
    existingQuery,
    showProfit,
    gstRatePercent: existing?.gstRatePercent ?? DEFAULT_GST_RATE_PERCENT,
    clientId,
    setClientId,
    issuedDate,
    setIssuedDate,
    validUntil,
    setValidUntil,
    minValidUntil,
    validityTooShort,
    note,
    setNote,
    lines,
    valid,
    showErrors,
    itemsQuery,
    clientsQuery,
    stockQuery,
    quickAdd,
    save,
    submit,
    updateLine,
    addLine: () => setLines((prev) => [...prev, newLine()]),
    removeLine: (key: string) => setLines((prev) => prev.filter((line) => line.key !== key)),
    cancel: () =>
      navigate(editing ? `/oil-mart/quotations/${quotationId}` : "/oil-mart/quotations"),
  };
}
