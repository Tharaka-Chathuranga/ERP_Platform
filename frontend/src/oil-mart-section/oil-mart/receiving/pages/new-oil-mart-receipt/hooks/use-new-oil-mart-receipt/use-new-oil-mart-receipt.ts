import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import dayjs from "dayjs";
import { qk } from "@core/queryKeys";
import { notifyError, notifySuccess } from "@core/notify";
import { listOilMartItems, listOilMartSuppliers } from "../../../../../master-data/api";
import { recordOilMartReceipt } from "../../../../api";
import {
  receiptLineTotal,
  type ReceiptLineDraft,
} from "../../../../components/receipt-line-editor";

let lineCounter = 0;
const newLine = (): ReceiptLineDraft => {
  lineCounter += 1;
  return { key: `line-${lineCounter}`, itemId: null, quantityLitres: undefined, buyUnitPrice: undefined };
};

export function useNewOilMartReceipt() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [supplierId, setSupplierId] = useState<string | null>(null);
  const [referenceNo, setReferenceNo] = useState("");
  const [receivedAt, setReceivedAt] = useState<Date | null>(new Date());
  const [note, setNote] = useState("");
  const [lines, setLines] = useState<ReceiptLineDraft[]>([newLine()]);
  const [showErrors, setShowErrors] = useState(false);

  const itemsQuery = useQuery({ queryKey: qk.oilMartItems(), queryFn: () => listOilMartItems() });
  const suppliersQuery = useQuery({
    queryKey: qk.oilMartSuppliers(),
    queryFn: listOilMartSuppliers,
  });

  const totalCost = useMemo(
    () => lines.reduce((sum, line) => sum + receiptLineTotal(line), 0),
    [lines],
  );

  const linesValid = lines.every(
    (line) => line.itemId && (line.quantityLitres ?? 0) > 0 && (line.buyUnitPrice ?? 0) > 0,
  );
  const valid = Boolean(supplierId) && Boolean(receivedAt) && lines.length > 0 && linesValid;

  const record = useMutation({
    mutationFn: () =>
      recordOilMartReceipt({
        supplierId: supplierId!,
        referenceNo: referenceNo.trim() || undefined,
        receivedAt: dayjs(receivedAt).toISOString(),
        note: note.trim() || undefined,
        lines: lines.map((line) => ({
          itemId: line.itemId!,
          quantityLitres: line.quantityLitres!,
          buyUnitPrice: line.buyUnitPrice!,
        })),
      }),
    onSuccess: (receipt) => {
      queryClient.invalidateQueries({ queryKey: qk.oilMartReceipts() });
      queryClient.invalidateQueries({ queryKey: qk.oilMartStock() });
      queryClient.invalidateQueries({ queryKey: qk.oilMartOverview() });
      receipt.lines.forEach((line) =>
        queryClient.invalidateQueries({ queryKey: qk.oilMartMovements(line.itemId) }),
      );
      notifySuccess(`${receipt.receiptNo} recorded — stock updated`);
      navigate(`/oil-mart/receipts/${receipt.id}`);
    },
    onError: notifyError,
  });

  function submit() {
    setShowErrors(true);
    if (!valid) return;
    record.mutate();
  }

  return {
    supplierId,
    setSupplierId,
    referenceNo,
    setReferenceNo,
    receivedAt,
    setReceivedAt,
    note,
    setNote,
    lines,
    totalCost,
    valid,
    showErrors,
    itemsQuery,
    suppliersQuery,
    record,
    submit,
    updateLine: (key: string, patch: Partial<ReceiptLineDraft>) =>
      setLines((prev) => prev.map((line) => (line.key === key ? { ...line, ...patch } : line))),
    addLine: () => setLines((prev) => [...prev, newLine()]),
    removeLine: (key: string) => setLines((prev) => prev.filter((line) => line.key !== key)),
    cancel: () => navigate("/oil-mart/receipts"),
  };
}
